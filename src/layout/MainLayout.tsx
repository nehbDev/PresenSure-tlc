import { Outlet } from "react-router-dom";
import CombinedLayout from "./Layout"; // Renamed import

function MainLayout() {
    return (
        <CombinedLayout>
            <Outlet />
        </CombinedLayout>
    );
}

export default MainLayout;