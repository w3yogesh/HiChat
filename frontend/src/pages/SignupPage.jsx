import React, { useContext, useState } from "react";
import axios from "axios";

import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import "../styles/signup.css";

import NavBar from "../component/Navbar";
import { server, AuthContext } from "../context/UserContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  if (isAuthenticated) {
    navigate("/chatting");
  }

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [progress, setProgress] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (event) => {
    setSignupData({
      ...signupData,
      [event.target.name]: event.target.value,
    });
  };

  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // email validation
    const emailPattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailPattern.test(signupData.email)) {
      toast.error("Please use a valid email address.");
      return;
    }

    // password validation

    try {
      setLoading(true);
      const response = await axios.post(
        `${server}/sendOtp`,
        { email: signupData.email },
        { withCredentials: true }
      );
      toast.success(`Otp successfully send to your mail 📫`);
      console.log(response.data);
      setProgress(true);
    } catch (error) {
      if (error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Otp can't be send 📪`);
      }
      // console.log("error : " , error.response.data.message);
      console.error("Error sending OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${server}/signup`,
        { ...signupData, otp },
        { withCredentials: true }
      );
      console.log(response.data);
      toast.success(``);
      navigate("/login");
    } catch (error) {
      toast.error(`invalid Otp ⛔ `);
      console.error("Error verifying OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Grid container justifyContent="center" alignItems="center" className="signupform">
        <Grid item xs={12} sm={8} md={6} lg={4} sx={{ position: "relative" }}>
          <div class="background">
            <div class="shape"></div>
            <div class="shape"></div>
          </div>
          <Box class={"signup"}>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            {loading && <CircularProgress size={100} />}
            {!loading && !progress && (
              <form onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      variant="outlined"
                      name="firstName"
                      value={signupData.firstName}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      variant="outlined"
                      name="lastName"
                      value={signupData.lastName}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      variant="outlined"
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      size="small"
                    />
                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      type="tel"
                      name="phoneNumber"
                      value={signupData.phoneNumber}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      size="small"
                    />
                    <TextField
                      label="Password"
                      variant="outlined"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={signupData.password}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={handleTogglePasswordVisibility}
                            >
                              {showPassword ? (
                                <VisibilityIcon />
                              ) : (
                                <VisibilityOffIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Sign Up
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
            {!loading && progress && (
              <form onSubmit={handleOtpSubmit}>
                <TextField
                  label="Enter OTP"
                  variant="outlined"
                  type="number"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  fullWidth
                  margin="normal"
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]{6}",
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  style={{ marginTop: "10px" }}
                >
                  Verify OTP
                </Button>
              </form>
            )}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default SignupPage;
