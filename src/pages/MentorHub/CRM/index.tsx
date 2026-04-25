// [MH] CRM — alias redirects to Students (unified per product decision)
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MHCRM() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/mh/students", { replace: true }); }, [navigate]);
  return null;
}
