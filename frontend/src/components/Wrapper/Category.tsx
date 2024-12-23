import { PropsWithChildren, useState } from "react";
import { IconType } from "react-icons";
import { FaChevronDown, FaChevronLeft } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Item from "./Item";

interface CategoryProps extends PropsWithChildren {
  to: string;
  icon?: IconType;
  name: string;
  location?: string;
  disableNavigate?: boolean;
}
export default function Category(props: CategoryProps) {
  const location = useLocation();
  const path = props.location ?? location.pathname;
  const [active, setActive] = useState(false);

  return <div className={`border-b-2 ${(path.startsWith(props.to) || active) ? " border-primary/20" : "border-transparent"}`}>
    {props.disableNavigate ? <>
      <div className={`flex justify-between items-center px-6 py-2 text-secondary ${(path.startsWith(props.to) || active) ? 'border-b-[3px] border-b-primary' : 'hover:bg-primary/10'}`} onClick={() => setActive(!active)}>
        <div className='flex items-center gap-x-4'>
          {props.icon && <props.icon />}
          <span className='font-semibold'>{props.name}</span>
        </div>
        {(path.startsWith(props.to) || active) ? <FaChevronDown /> : <FaChevronLeft />}
      </div>
      {(path.startsWith(props.to) || active) && <div>
        <Item to={props.to} name="Dashboard" />
        {props.children}
      </div>}
    </> : <>
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
    </>}
  </div>
}