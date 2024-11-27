import { PropsWithChildren } from "react";
import { IconType } from "react-icons";
import { FaChevronDown, FaChevronLeft } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Item from "./Item";

interface CategoryProps extends PropsWithChildren {
  to: string;
  icon?: IconType;
  name: string;
  location?: string;
}
export default function Category(props: CategoryProps) {
  const location = useLocation();
  const path = props.location ?? location.pathname;

  return <div className={`border-b-2 ${path.startsWith(props.to) ? " border-primary/20" : "border-transparent"}`}>
    <Link to={props.to} className={`flex justify-between items-center px-6 py-2 text-secondary ${path.startsWith(props.to) ? "border-b-[3px] border-b-primary" : "hover:bg-primary/10"}`}>
    <div className="flex items-center gap-x-4">
      {props.icon && <props.icon />}
      <span className="font-semibold">{props.name}</span>
    </div>
      {path.startsWith(props.to) ? <FaChevronDown /> : <FaChevronLeft />}
    </Link>
    {path.startsWith(props.to) && <div>
      <Item to={props.to} name="Dashboard" />
      {props.children}
    </div>}
  </div>
}