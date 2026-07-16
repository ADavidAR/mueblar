import { ViroARSceneNavigator } from "@reactvision/react-viro"

export default function AR() {

    return (
        <ViroARSceneNavigator
            initialScene={{ scene: MyARScene }}
        />
    )
}
