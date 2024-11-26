import { useLocation } from "react-router-dom";
import Card from ".";
import { ServiceInfoPack } from "../../../utils/managers/ServiceInfoPackManager";

interface ServiceInfoPackProps {
  sip: ServiceInfoPack;
  className?: string;
}

export function ServiceInfoPackCard(props: ServiceInfoPackProps) {
  const location = useLocation();
  const removeHTMLTags = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  return <Card
    className={props.className}
    hideThumbnail
    url={`${location.pathname}/${props.sip.id}`}
  >
    <h1 className="font-semibold mb-4 text-lg">{props.sip.subject}</h1>
    <div className="text-xs text-black/80">{removeHTMLTags(props.sip.details ?? "").slice(0, 150)}{(removeHTMLTags(props.sip.details ?? "").length ?? 0) > 150 ? "..." : ""}</div>
  </Card>
}