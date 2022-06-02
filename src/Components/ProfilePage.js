import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

function ProfilePage() {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate("/");
    }
    navigate("/Profile");
    return (<>
        <header>
            <h1>Profile Page</h1>
            <OverviewBox />
        </header>
        <Button onClick={handleNavigate}>Back</Button>
        </>
    );
}

function OverviewBox(props) {
    // This is passed all the way down from App

    const { user } = useAuth();

    const [name, setName] = useState("Loading name...");

    useEffect(() => {
        if (user?.displayName) {
            setName(user.displayName);
        }
    }, [user]);

    return (
        <div>
            <p>
                Welcome back,{" "}
                <strong
                    role="button"
                    onClick={() => {
                        const newName = prompt("What is your name?", name);
                        setName(newName);
                        window.localStorage.setItem("name", newName);
                    }}
                >
                    {name || "<set a name>"}
                </strong>
                !
            </p>
        </div>
    );
}

export default ProfilePage;
