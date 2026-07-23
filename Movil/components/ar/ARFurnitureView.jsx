import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, Pressable, PanResponder, PermissionsAndroid, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ViroARSceneNavigator } from '@reactvision/react-viro'

import { SPAWN_DISTANCE } from '../../mocks/arModels'
import { useARObjects } from '../../hooks/useARObjects'
import { useModelCatalog } from '../../hooks/useModelCatalog'
import { findFreeSpot, isObstructed } from '../../utils/collision'
import ARFurnitureScene from './ARFurnitureScene'
import ARActionButton from './ARActionButton'
import Brand from '../ui/Brand'
import { MenuIcon, MoveIcon, RotateIcon, XIcon } from '../Icons'
import SceneObjectsModal from './SceneObjectsModal'

const HIT_EXISTING_PLANE = 'ExistingPlaneUsingExtent'
const OBSTRUCTION_BANNER_MS = 1200
// Grados de rotación por píxel de arrastre horizontal en modo "Girar"
const ROTATE_PX_TO_DEG = 0.4

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
 * `sku`/`model`: props de entrada, la variación concreta que el usuario
 * tocó en "Ver en tu espacio" (ver ProductDetails.jsx → ar.jsx).
 */
export default function ARFurnitureView({ sku, model }) {
    const insets = useSafeAreaInsets()
    const scene = useARObjects()

    const [ showObjectsModal, setShowObjectsModal ] = useState(false)

    const [arActive, setArActive] = useState(false)
    const [permissionDenied, setPermissionDenied] = useState(false)
    const [tracking, setTracking] = useState(false)
    const [floorY, setFloorY] = useState(null) // null = sin suelo detectado aún
    const [obstruction, setObstruction] = useState(false)
    const [mode, setMode] = useState('move') // 'move' | 'rotate' — qué hace el arrastre de un dedo

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

    // Modelos 3D en uso: los ya colocados y la variación que se va a
    // colocar. Se resuelven por sku
    // contra la API y se cachean en memoria
    const catalogSkus = useMemo(() => {
        const list = scene.objects.map((o) => ({ model: o.productId, sku: o.sku }))
        if (sku && model) list.push({ model, sku })
        return list
    }, [scene.objects, sku, model])
    const getObjectData = useModelCatalog(catalogSkus)
    const currentModel = sku ? getObjectData(sku) : null

    const selectedObject = scene.objects.find((o) => o.id === scene.selectedId)
    const ready = tracking && floorY !== null && !!currentModel

    // Leídos dentro del PanResponder de rotación, que se crea una sola vez
    const selectedObjectRef = useRef(selectedObject)
    useEffect(() => {
        selectedObjectRef.current = selectedObject
    }, [selectedObject])

    const getModelRef = useRef(getObjectData)
    useEffect(() => {
        getModelRef.current = getObjectData
    }, [getObjectData])

    // Rotación Y confirmada al iniciar el gesto de swipe en curso
    const rotateBaseY = useRef(0)

    // Cada nueva selección arranca en modo "mover"
    useEffect(() => {
        const inittMove = () => {
            setMode('move')
        }

        inittMove()
    }, [scene.selectedId])

    const flagObstruction = useCallback(() => {
        setObstruction(true)
        clearTimeout(obstructionTimer.current)
        obstructionTimer.current = setTimeout(() => setObstruction(false), OBSTRUCTION_BANNER_MS)
    }, [])

    const handleFloorFound = useCallback((y) => {
        setFloorY(y)
    }, [])

    // Modo "rotate": deslizar un dedo en cualquier parte de la pantalla gira
    // el mueble seleccionado. Trabaja directo sobre deltas de píxeles de RN
    // (sin pasar por el raycast de Viro), así que responde al instante.

    const [rotateHandlers, setRotateHandlers] = useState(null)
    useEffect(() => {
        const responder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                rotateBaseY.current = selectedObjectRef.current?.rotation[1] ?? 0
            },
            onPanResponderMove: (_, gestureState) => {
                const obj = selectedObjectRef.current
                if (!obj) return
                const candidateY = rotateBaseY.current + gestureState.dx * ROTATE_PX_TO_DEG
                const objModel = getModelRef.current(obj.sku)
                if (
                    isObstructed({
                        position: obj.position,
                        rotationY: candidateY,
                        objectId: obj.id,
                        collisionBox: objModel?.collisionBox,
                        objects: objectsRef.current,
                        anchors: anchorsRef.current,
                        getCollisionBox: (s) => getModelRef.current(s)?.collisionBox,
                    })
                ) {
                    flagObstruction()
                    return
                }
                scene.updateTransform(obj.id, { rotation: [0, candidateY, 0] })
            },
        })
        setRotateHandlers(responder.panHandlers)
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
        if (!arSceneRef.current || !ready || !currentModel) return

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
            collisionBox: currentModel.collisionBox,
            objects: objectsRef.current,
            anchors: anchorsRef.current,
            getCollisionBox: (s) => getObjectData(s)?.collisionBox,
        })

        if (!spot) {
            flagObstruction()
            return
        }
        scene.addObject(model, sku, spot)
    }

    //AR sin inicializar la cámara no se solicita hasta que el usuario lo pide explícitamente
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
        <>
        <View className="flex-1 bg-black">
            <ViroARSceneNavigator
                autofocus
                initialScene={{ scene: ARFurnitureScene }}
                viroAppProps={{
                    objects: scene.objects,
                    selectedId: scene.selectedId,
                    floorY: floorY ?? -1,
                    mode,
                    getModel: getObjectData,
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
                style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 76 }}
            >
                <View className="px-6">
                    <View
                        className="flex-row items-center justify-between"
                    >
                        <Pressable
                            onPress={() => setShowObjectsModal(true)}
                            hitSlop={10}
                            className="h-9 w-9 items-center justify-center rounded-full active:bg-stone-200/60 dark:active:bg-white/5"
                        >
                            <MenuIcon />
                        </Pressable>
                        <Brand className="text-white flex-end" />

                    </View>
                    <View className="mt-4 rounded-2xl bg-black/45 px-4 py-3">
                        <Text className="text-sm text-white/90">
                            {!tracking
                                ? 'Mueve el teléfono lentamente para iniciar el seguimiento...'
                                : floorY === null
                                ? 'Apunta al suelo hasta que aparezca la malla de detección...'
                                : selectedObject
                                    ? mode === 'rotate'
                                        ? 'Desliza un dedo para girar · toca fuera para soltar'
                                        : 'Arrastra para trasladar · toca fuera para soltar'
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

                <View
                    className="flex-1"
                    pointerEvents={mode === 'rotate' && selectedObject ? 'auto' : 'none'}
                    {...(mode === 'rotate' && selectedObject && rotateHandlers ? rotateHandlers : {})}
                />

                <View className="px-6 mb-4">
                    { selectedObject || (sku && model) ? (

                    <View className="rounded-2xl bg-black/45 p-4">
                        <Text className="text-[10px] uppercase tracking-[2px] text-copper">
                            {selectedObject ? 'Manipulando' : 'Pieza a colocar'}
                        </Text>
                        <Text className="mt-1 text-lg font-semibold text-white">
                            {selectedObject ? getObjectData(selectedObject.sku)?.name : currentModel?.name}
                        </Text>
                        <Text className="text-xs text-white/60">
                            {scene.objects.length} objeto(s) en escena
                        </Text>
                    </View>
                    ) 
                    : (
                        <View className="rounded-2xl bg-black/45 p-4">
                            <Text className="text-sm text-white/60">
                                Selecciona un objeto en escena o agregalo desde el catalogo
                            </Text>
                        </View>
                    )}

                    {selectedObject && (
                        <View className="mt-4 flex-row justify-center gap-6">
                            <ARActionButton
                                icon={<MoveIcon />}
                                label="Mover"
                                active={mode === 'move'}
                                onPress={() => setMode('move')}
                            />
                            <ARActionButton
                                icon={<RotateIcon />}
                                label="Girar"
                                active={mode === 'rotate'}
                                onPress={() => setMode('rotate')}
                            />
                            <ARActionButton
                                icon={<XIcon />}
                                label="Eliminar"
                                onPress={() => scene.removeObject(selectedObject.id)}
                            />
                        </View>
                    )}

                    <Pressable
                        disabled={!ready || !currentModel}
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
        <SceneObjectsModal
            visible={showObjectsModal}
            onHide={() => setShowObjectsModal(false)}
            scene={scene}
        />
        
        </>
    )
}
