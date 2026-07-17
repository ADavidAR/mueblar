import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, PermissionsAndroid, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ViroARSceneNavigator } from '@reactvision/react-viro'

import { PRODUCTS } from '../../mocks/catalogData'
import { AR_MODELS, SPAWN_DISTANCE } from '../../mocks/arModels'
import { useARObjects } from '../../hooks/useARObjects'
import { findFreeSpot } from './collision'
import ARFurnitureScene from './ARFurnitureScene'
import ARActionButton from './ARActionButton'
import Brand from '../ui/Brand'
import { XIcon } from '../Icons'

const HIT_EXISTING_PLANE = 'ExistingPlaneUsingExtent'
const OBSTRUCTION_BANNER_MS = 1200

/**
 * Módulo AR de MueblAR. Ciclo de vida:
 *
 * 1. Inactivo: la cámara no se toca. Al pulsar "Colocar objeto" por primera
 *    vez se solicita el permiso de cámara de Android y, si se concede, se
 *    monta ViroARSceneNavigator (inicializa la sesión de ARCore).
 * 2. Escaneo: ARCore detecta planos; el plano horizontal más bajo se toma
 *    como suelo y habilita el anclaje.
 * 3. Colocación: cada pulsación posterior de "Colocar objeto" lanza un hit
 *    test con el rayo hacia adelante de la cámara contra los planos
 *    detectados; el mueble se instancia en el punto de impacto (o a
 *    SPAWN_DISTANCE frente a la cámara como respaldo), desplazado al hueco
 *    libre más cercano si el punto está ocupado por otro modelo.
 *
 * Los muebles ya colocados conservan sus coordenadas absolutas de mundo en
 * `useARObjects` (array {id, productId, position [x,y,z], rotation}) y solo
 * el seleccionado acepta gestos.
 */
export default function ARFurnitureView({ productId }) {
    const insets = useSafeAreaInsets()
    const scene = useARObjects()

    const [arActive, setArActive] = useState(false)
    const [permissionDenied, setPermissionDenied] = useState(false)
    const [tracking, setTracking] = useState(false)
    const [floorY, setFloorY] = useState(null) // null = sin suelo detectado aún
    const [obstruction, setObstruction] = useState(false)

    const arSceneRef = useRef(null)
    // Planos detectados por ARCore, compartidos con la lógica de colisiones
    const anchorsRef = useRef(new Map())
    const obstructionTimer = useRef(null)

    // Copia de objetos, legible dentro de los
    // manejadores de gestos sin recrear callbacks en cada render
    const objectsRef = useRef(scene.objects)
    useEffect(() => {
        objectsRef.current = scene.objects
    }, [scene.objects])

    const product =
        PRODUCTS.find((p) => p.id === productId && AR_MODELS[p.id]) ||
        PRODUCTS.find((p) => AR_MODELS[p.id])
    const selectedObject = scene.objects.find((o) => o.id === scene.selectedId)
    const ready = tracking && floorY !== null

    const flagObstruction = useCallback(() => {
        setObstruction(true)
        clearTimeout(obstructionTimer.current)
        obstructionTimer.current = setTimeout(() => setObstruction(false), OBSTRUCTION_BANNER_MS)
    }, [])

    const handleFloorFound = useCallback((y) => {
        // El plano horizontal más bajo de la habitación es el suelo
        setFloorY((prev) => (prev === null || y < prev ? y : prev))
    }, [])

    const requestCameraPermission = async () => {
        if (Platform.OS !== 'android') return true
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Cámara para Realidad Aumentada',
        message: 'MueblAR usa la cámara para mostrar los muebles en tu habitación.',
        buttonPositive: 'Permitir',
        buttonNegative: 'Ahora no',
        })
        return result === PermissionsAndroid.RESULTS.GRANTED
    }

    const handlePlacePress = async () => {
        // Primer uso: pedir cámara e inicializar el visor AR
        if (!arActive) {
            const granted = await requestCameraPermission()
            setPermissionDenied(!granted)
            if (granted) setArActive(true)
            return
        }
        if (!arSceneRef.current || !ready || !product) return

        // Anclaje por hit test: rayo desde la cámara hacia adelante contra los
        // planos reales detectados
        const camera = await arSceneRef.current.getCameraOrientationAsync()
        const hits = await arSceneRef.current.performARHitTestWithRay(camera.forward)
        const planeHit = hits.find((h) => h.type === HIT_EXISTING_PLANE)
        const base = planeHit
        ? planeHit.transform.position
        : [
            camera.position[0] + camera.forward[0] * SPAWN_DISTANCE,
            floorY,
            camera.position[2] + camera.forward[2] * SPAWN_DISTANCE,
            ]

        const spot = findFreeSpot({
            position: [base[0], floorY, base[2]],
            modelId: product.id,
            objects: objectsRef.current,
            anchors: anchorsRef.current,
        })
        if (!spot) {
            flagObstruction()
            return
        }
        scene.addObject(product.id, spot)
    }

    // Fase 1: AR sin inicializar — la cámara no se solicita hasta que el
    // usuario lo pide explícitamente
    if (!arActive) {
        return (
            <View
                className="flex-1 items-center justify-center bg-[#36322e] px-8"
                style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 8 }}
            >
                <Brand className="text-white" />
                <Text className="mt-6 text-center text-sm text-white/70">
                El visor AR usa la cámara para escanear tu habitación y colocar los muebles a escala
                real.
                </Text>
                {permissionDenied && (
                <Text className="mt-3 text-center text-xs text-red-300">
                    Permiso de cámara denegado. Actívalo en Ajustes → Aplicaciones → MueblAR para usar la
                    vista AR.
                </Text>
                )}
                <Pressable
                    onPress={handlePlacePress}
                    className="mt-8 items-center self-stretch rounded-full bg-copper py-4 active:opacity-80"
                >
                    <Text className="text-sm font-semibold uppercase tracking-[2px] text-white">
                        Colocar objeto
                    </Text>
                </Pressable>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-black">
            <ViroARSceneNavigator
                autofocus
                initialScene={{ scene: ARFurnitureScene }}
                viroAppProps={{
                    objects: scene.objects,
                    selectedId: scene.selectedId,
                    floorY: floorY ?? -1,
                    objectsRef,
                    anchorsRef,
                    registerSceneRef: (ref) => {
                        arSceneRef.current = ref
                    },
                    onTrackingChange: setTracking,
                    onFloorFound: handleFloorFound,
                    onSelect: scene.selectObject,
                    onCommit: scene.updateTransform,
                    onObstruction: flagObstruction,
                }}
                style={{ flex: 1 }}
            />

        {/* Overlay de UI sobre la cámara */}
        <View
            pointerEvents="box-none"
            className="absolute inset-0"
            style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}
        >
            <View className="px-6">
            <Brand className="text-white" />
            <View className="mt-4 rounded-2xl bg-black/45 px-4 py-3">
                <Text className="text-sm text-white/90">
                    {!tracking
                        ? 'Mueve el teléfono lentamente para iniciar el seguimiento...'
                        : floorY === null
                        ? 'Apunta al suelo hasta que aparezca la malla de detección...'
                        : selectedObject
                            ? 'Arrastra para trasladar · gira con dos dedos · toca fuera para soltar'
                            : 'Suelo detectado: toca un mueble para manipularlo'}
                </Text>
            </View>
            {obstruction && (
                <View className="mt-2 rounded-2xl bg-red-900/70 px-4 py-3">
                <Text className="text-sm font-semibold text-white">
                    Obstrucción: no hay espacio libre en ese punto
                </Text>
                </View>
            )}
            </View>

            <View className="flex-1" pointerEvents="none" />

            <View className="px-6 mb-16">
            <View className="rounded-2xl bg-black/45 p-4">
                <Text className="text-[10px] uppercase tracking-[2px] text-copper">
                    {selectedObject ? 'Manipulando' : 'Pieza a colocar'}
                </Text>
                <Text className="mt-1 text-lg font-semibold text-white">
                    {selectedObject
                        ? PRODUCTS.find((p) => p.id === selectedObject.productId)?.name
                        : product?.name}
                </Text>
                <Text className="text-xs text-white/60">
                    {scene.objects.length} objeto(s) en escena
                </Text>
            </View>

            {selectedObject && (
                <View className="mt-4 flex-row justify-center">
                <ARActionButton
                    icon={<XIcon />}
                    label="Eliminar"
                    onPress={() => scene.removeObject(selectedObject.id)}
                />
                </View>
            )}

            <Pressable
                disabled={!ready || !product}
                onPress={handlePlacePress}
                className="mt-4 items-center rounded-full bg-copper py-4 active:opacity-80 disabled:opacity-40"
            >
                <Text className="text-sm font-semibold uppercase tracking-[2px] text-white">
                    Colocar objeto
                </Text>
            </Pressable>
            </View>
        </View>
        </View>
    )
}
