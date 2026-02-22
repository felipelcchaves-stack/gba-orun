import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextType {
  isDemo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
});

export const useDemo = () => useContext(DemoContext);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [isDemo, setIsDemo] = useState(true);
  return (
    <DemoContext.Provider value={{ isDemo, enterDemo: () => setIsDemo(true), exitDemo: () => setIsDemo(false) }}>
      {children}
    </DemoContext.Provider>
  );
};
