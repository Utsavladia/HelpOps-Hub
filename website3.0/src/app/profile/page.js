"use client"
import React, { useContext, useEffect, useState } from "react";
import ProfilepageDetails from "@components/profile/ProfilepageDetails";
import SettingsTab from "@components/profile/SettingsTab";
import ResourcesTab from "@components/profile/ResourcesTab";
import NotificationTab from "@components/profile/NotificationTab";
import { Context } from "@context/store";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faChartBar,
  faBell,
  faComment,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBlog,
  faChevronRight,
  faCog,
  faHouseUser,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import GrowYourReachTab from "@components/profile/GrowYourReachTab";
import { FaX, FaBars } from "react-icons/fa6";
import DashboardTab from "@components/profile/DashboardTab";
import DeletedBlogs from "@components/profile/DeletedBlogs";
import Unblock from "@components/profile/Unblock";

// Define animation variants for menu
const menuVariants = {
  hidden: { opacity: 0, y: "-100%" },
  visible: { opacity: 1, y: "0%" },
  exit: { opacity: 0, y: "-100%" }
};

const Settings = () => (
  <div className="min-h-screen mt-10 rounded-xl">
    <SettingsTab />
  </div>
);

const Resources = () => (
  <div className="min-h-screen mt-10 rounded-xl">
    <ResourcesTab />
  </div>
);

const Notifications = () => <div><NotificationTab/></div>;
const GrowYourReach = () => <div><GrowYourReachTab/></div>;
const BlogDetails = () => <div className="min-h-screen mt-10 rounded-xl"><DashboardTab/></div>;
const DeletedBlogs1=()=><div  className="min-h-screen mt-10 rounded-xl"><DeletedBlogs/></div>
const UnblockBlogs1=()=><div  className="min-h-screen mt-10 rounded-xl"><Unblock/></div>

const Profile = ({ id ,isView}) => (
  <div className="bg-gray-100 mt-10 rounded-xl">
    <ProfilepageDetails  isViewProfile={isView} id={id} />
  </div>
);

const MenuItem = ({
  title,
  icon,
  children,
  isCollapsible,
  onClick,
  isActive,
  theme,
  notificationCount // Add notificationCount as a prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div
        onClick={() => {
          if (isCollapsible) setIsOpen(!isOpen);
          onClick();
        }}
        className={`py-2 px-4 hover:bg-gray-300 rounded flex items-center cursor-pointer justify-between ${
          isActive
            ? theme
              ? "bg-[#6089a4] hover:!bg-[#6089a4] text-white"
              : "bg-[#6f6f6f] hover:!bg-[#262626] text-white"
            : theme
            ? "bg-gray-100 hover:bg-gray-200"
            : "hover:!bg-[#262626]"
        }`}
      >
        <div className="flex items-center relative">
          <FontAwesomeIcon icon={icon} className="mr-2" />
          {title}
          {title === "Notifications" && notificationCount > 0 && (
            <span className="absolute -top-1 -left-2 bg-red-500 text-white rounded-full px-2 py-1 scale-75 text-xs font-bold">
              {notificationCount}
            </span>
          )}
        </div>
        {isCollapsible && (
          <FontAwesomeIcon
            icon={faChevronRight}
            className={`transition-transform duration-200 mr-5 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        )}
      </div>
      {isCollapsible && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pl-6"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const { theme, setColor, isLogin, finalUser,setIsNotification } = useContext(Context);
  const [activeComponent, setActiveComponent] = useState(<Profile id="" />);
  const [activeMenuItem, setActiveMenuItem] = useState("Profile");
  const [menuVisible, setMenuVisible] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0); // State for unread notifications count
  const pathname = usePathname(); // Get current path
  const [id, setId] = useState("");
  let [isView,setIsView]=useState(false)
  const isViewProfile = id.length > 0;
  const router = useRouter();

  useEffect(() => {
    // Function to get query parameters from URL
    const getUrlParameter = (name) => {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    };

    // Get the 'id' query parameter from the URL
    const idFromQuery = getUrlParameter("id");
    let isView=getUrlParameter("isView")
    if(isView){
      setIsView(true)
    }
    if (idFromQuery) {
      const storedUser = localStorage.getItem("finalUser");
      const parsedUser = storedUser ? JSON.parse(storedUser) : isViewProfile;
      if (parsedUser.username !== idFromQuery) {
        setId(idFromQuery);
      }
    }
    setActiveComponent(<Profile id={id} isView={isView} />);
    setActiveMenuItem("Profile");
  }, [id, isViewProfile]); // Adjust dependencies if needed

  useEffect(() => {
    // Refresh the color from localStorage on page reload
    const color = localStorage.getItem("color");
    if (color) {
      setColor(color);
    }

    const handleResize = () => {
      setMenuVisible(window.innerWidth > 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setColor]);

  useEffect(() => {
    // Fetch notifications and calculate unread count
    const fetchNotifications = async () => {
      if (finalUser?.email) {
        try {
          const response = await fetch(`/api/notifications?userEmail=${finalUser.email}`);
          if (response.ok) {
            const data = await response.json();
            const unreadCount = Object.values(data.followerList).filter(notif => !notif.isRead).length +
                                Object.values(data.blogList).filter(notif => !notif.isRead).length;
            setNotificationCount(unreadCount);
          } else {
            console.error("Error fetching notifications:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [finalUser]);

  const handleMenuClick = (component, title) => {
    if(title=="Notifications"){
      setIsNotification(0)
    }
    setActiveComponent(component);
    setActiveMenuItem(title);

  };

  const handleHomeButton = () => {
    router.push("/");
  };
  const handleDevopsInsights = () => {
    router.push("/devopsforum");
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <div
      className={`bg-gray-100 overflow-hidden mt-24 flex min-h-screen w-full ${
        theme ? "" : "bg-[#1c1a1a]"
      } max-lg:flex-col`}
    >
      {!menuVisible && (
        <div className="w-[80%] bg-gray-100 m-auto pt-8 pl-4 mb-10 z-50 cursor-pointer max-lg:block hidden" >
          <FaBars size={24} className={theme ? "text-gray-600" : "text-black"} onClick={toggleMenu}/>
          <hr className="w-full border-gray-200 border-[3px] my-6"/>
        </div>
      )}
      {menuVisible && (
        <div className="w-[80%] m-auto bg-gray-100 pt-8 pl-4 mb-10 z-50 cursor-pointer max-lg:block hidden" >
          <FaX size={24} className={theme ? "text-gray-600" : "text-black"} onClick={toggleMenu}/>
        </div>
      )}
      <AnimatePresence>
        {menuVisible && !isViewProfile && (
          <motion.div
            id="menu"
            className={`${
              theme ? "max-lg:bg-gray-100" : "bg-[#1c1a1a]"
            } w-[20%] max-lg:w-[80%] max-lg:m-auto  max-sm:h-full border-t-4 border-gray-200 px-5 py-10 text-lg`}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5 }} 
          >
            <div
              className={`${
                theme ? "text-gray-600" : "text-white"
              } flex-1 overflow-y-auto space-y-4`}
            >
              <MenuItem
                title="Home"
                icon={faHouseUser}
                isCollapsible={false}
                onClick={handleHomeButton}
                isActive={activeMenuItem === "Home"}
                theme={theme}
              />
              <MenuItem
                title="Profile"
                icon={faAddressCard}
                isCollapsible={true}
                onClick={() => handleMenuClick(<Profile isView={isView} id={id} />, "Profile")}
                isActive={activeMenuItem === "Profile"}
                theme={theme}
              >
                <ul className="space-y-2 mt-2 cursor-pointer">
                  <li
                    className="py-2 px-4 hover:bg-gray-300 rounded"
                    onClick={() =>
                      handleMenuClick(<BlogDetails />, "BlogDetails")
                    }
                  >
                    Blog Details
                  </li>
                  <li
                    className="py-2 px-4 hover:bg-gray-300 rounded"
                    onClick={() =>
                      handleMenuClick(<DeletedBlogs />, "DeletedBlogs1")
                    }
                  >
                    Deleted Blogs
                  </li>
                  <li
                    className="py-2 px-4 hover:bg-gray-300 rounded"
                    onClick={() =>
                      handleMenuClick(<Unblock />, "UnblockBlogs1")
                    }
                  >
                    Blocked Blogs
                  </li>
                </ul>
              </MenuItem>
              <MenuItem
                title="Grow Your Reach"
                icon={faUserFriends}
                isCollapsible={false}
                onClick={() => handleMenuClick(<GrowYourReach/>, "GrowYourReach")}
                isActive={activeMenuItem === "GrowYourReach"}
                theme={theme}
              />
              <MenuItem
                title="DevOps Insights"
                icon={faComment}
                isCollapsible={false}
                onClick={() =>
                  handleDevopsInsights()
                }
                isActive={activeMenuItem === "DevopsInsights"}
                theme={theme}
              />
              <MenuItem
                title="Blogs Page"
                icon={faBlog}
                isCollapsible={false}
                onClick={() => router.push("/blogs")}
                theme={theme}
              />
              <MenuItem
                title="Resources"
                icon={faChartBar}
                isCollapsible={false}
                onClick={() => handleMenuClick(<Resources />, "Resources")}
                isActive={activeMenuItem === "Resources"}
                theme={theme}
              />
              <MenuItem
                title="Notifications"
                icon={faBell}
                isCollapsible={false}
                onClick={() =>
                  handleMenuClick(<Notifications />, "Notifications")
                }
                isActive={activeMenuItem === "Notifications"}
                theme={theme}
                notificationCount={notificationCount} // Pass notificationCount to MenuItem
              />
              <MenuItem
                title="Settings"
                icon={faCog}
                isCollapsible={false}
                onClick={() => handleMenuClick(<Settings />, "Settings")}
                isActive={activeMenuItem === "Settings"}
                theme={theme}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-[80%] max-md:w-[95%] m-auto">
        <div
          className={`w-full px-10 max-sm:px-2 bg-gray-200 ${
            theme
              ? "shadow-[5px_5px_15px_rgba(0,0,0,0.195)]"
              : "shadow-md shadow-white"
          } ${theme ? "bg-[#fffaf4] border-2" : "bg-[#1e1d1d] border-2"}`}
        >
          {activeComponent}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
