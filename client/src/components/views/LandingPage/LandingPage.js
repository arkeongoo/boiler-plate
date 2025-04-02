// import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  // useEffect(() => {
  //   axios.get("http://localhost:5000/api/a").then((response) => {
  //     console.log(response);
  //   });
  // }, []);

  function onClick() {
    axios
      .post(
        "http://localhost:5000/api/users/logout",
        {},
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log(response);
        if (response.data.success) {
          navigate("/login");
        } else {
          alert("error");
        }
      });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <h2>시작 페이지</h2>
      <button onClick={onClick}>Log out</button>
    </div>
  );
}

export default LandingPage;
