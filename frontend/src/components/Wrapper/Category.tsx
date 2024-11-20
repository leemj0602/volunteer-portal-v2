import { PropsWithChildren } from "react";
import { IconType } from "react-icons";
import { FaChevronDown, FaChevronLeft } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Item from "./Item";
import { RxDashboard } from "react-icons/rx";

interface CategoryProps extends PropsWithChildren {
  to: string;
  icon?: IconType;
  name: string;
}
export default function Category(props: CategoryProps) {
  const location = useLocation();

  return <div>
    <Link to={props.to} className={`flex justify-between items-center px-6 py-2 border-b-[3px] text-secondary ${location.pathname.startsWith(props.to) ? "border-b-primary" : "border-b-transparent hover:border-b-primary"}`}>
    <div className="flex items-center gap-x-4">
      {props.icon && <props.icon />}
      <span className="font-semibold">{props.name}</span>
    </div>
      {location.pathname.startsWith(props.to) ? <FaChevronDown /> : <FaChevronLeft />}
    </Link>
    {location.pathname.startsWith(props.to) && <div>
      <Item to={props.to} name="Dashboard" />
      {props.children}
    </div>}
  </div>
}