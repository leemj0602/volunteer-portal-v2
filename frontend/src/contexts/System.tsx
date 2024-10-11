import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { System } from "../../utils/v2/entities/System";
import SystemHandler from "../../utils/v2/handlers/SystemHandler";

interface SystemContextType {
    system: System | null;
    setSystem: React.Dispatch<React.SetStateAction<System | null>>;
}
export const SystemContext = createContext<SystemContextType | null>(null);

export const SystemProvider = ({ children }: PropsWithChildren) => {
    const [system, setSystem] = useState<System | null>(null);
    
    useEffect(() => {
        (async () => {
            const system = await SystemHandler.fetch();
            setSystem(system);
        })(); 
    }, []);

    return <SystemContext.Provider value={{ system, setSystem }}>
        {children}
    </SystemContext.Provider>
}

export const useSystemContext = (): (SystemContextType | null) => {
    const context = useContext(SystemContext);
    return context;
}