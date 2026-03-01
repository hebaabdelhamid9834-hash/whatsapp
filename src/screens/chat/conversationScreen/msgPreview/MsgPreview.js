import { View } from "react-native";
import MsgText from "./MsgText";
import MsgImage from "./MsgImage";
import MsgVideo from "./MsgVideo";
import MsgAudio from "./MsgAudio";
import MsgLocation from "./MsgLocation";
import MsgDoc from "./MsgDoc";
import MsgContact from "./MsgContact";
import MsgButton from "./MsgButton";
import MsgList from "./MsgList";

export default function MsgPreview({ msg }) {
  return (
    <View>
      {msg?.type === "text" && <MsgText msg={msg} />}
      {msg?.type === "image" && <MsgImage msg={msg} />}
      {msg?.type === "video" && <MsgVideo msg={msg} />}
      {msg?.type === "audio" && <MsgAudio msg={msg} />}
      {msg?.type === "location" && <MsgLocation msg={msg} />}
      {msg?.type === "document" && <MsgDoc msg={msg} />}
      {msg?.type === "contact" && <MsgContact msg={msg} />}
      {msg?.type === "button" && <MsgButton msg={msg} />}
      {msg?.type === "list" && <MsgList msg={msg} />}
    </View>
  );
}
