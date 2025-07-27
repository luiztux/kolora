import React from 'react';
import { useLocation } from 'react-router-dom';

type MenuContextType = {
    openMenu: boolean;
    toggleOpenMenu: () => void;
}

const MenuContext = React.createContext<MenuContextType>({
    openMenu: false,
    toggleOpenMenu: () => {}
});

export const useMenuContext = () => React.useContext(MenuContext);

export const MenuContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [openMenu, setOpenMenu] = React.useState<boolean>(false);
    const location = useLocation();

    React.useEffect(() => {
        setOpenMenu(false);
    }, [location.pathname])

    const toggleOpenMenu = () => {
        setOpenMenu((prevOpen) => !prevOpen)
    }

    const MemoizedMenuContextValues = React.useMemo(() => ({
        openMenu,
        toggleOpenMenu
    }), [openMenu])

    return (
        <MenuContext.Provider value={MemoizedMenuContextValues}>
            {children}
        </MenuContext.Provider>
    )
}