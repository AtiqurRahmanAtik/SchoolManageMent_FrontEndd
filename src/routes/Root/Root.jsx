import { Outlet, useLocation } from "react-router-dom";
import Footer from '../../components/Footer';
import NavigationBar from "../../components/NavigationBar";

const Root = () => {
    const location = useLocation();
    
    // Logic: Hide if path is exactly "/login" OR exactly "/register"
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    return (
        <div>
            <header>
                {/* Show NavigationBar ONLY if NOT on an auth page */}
                {!isAuthPage && <NavigationBar />}
            </header>
      
            <main>
                {/* This renders HomePage, which then renders AboutUs via its own Outlet */}
                <Outlet />
            </main>

            <footer>
                {!isAuthPage && <Footer />}
            </footer>
        </div>
    );
};

export default Root;