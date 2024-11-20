import { IconType } from "react-icons"
import { Link, useLocation } from "react-router-dom";

interface ItemProps {
  to: string;
  icon?: IconType;
  name: string;
}

export default function Item(props: ItemProps) {
  const location = useLocation();

  return <Link to={props.to} className={`flex pl-12 text-sm py-2 items-center gap-x-4 text-secondary border-l-4 font-semibold ${location.pathname == props.to ? "bg-primary/20 text-secondary/90 border-l-secondary/70" : "hover:bg-primary/10 hover:text-secondary/90 border-l-transparent hover:border-l-secondary/70"}`}>
    {props.icon && <props.icon />}
    <span>{props.name}</span>
  </Link>
}