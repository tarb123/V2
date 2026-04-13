// "use client";
// import React, { useState, ChangeEvent, FormEvent } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import GoogleLoginButton from "../components/GoogleLoginButton";
// import { CredentialResponse } from "@react-oauth/google";

// const Login: React.FC = () => {
//   const [formData, setFormData] = useState({ name: "", password: "" });
//   const [message, setMessage] = useState("");
//   const router = useRouter();

// const API_URL = "";

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   type AuthResponse = {
//     token: string;
//     message?: string;
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post<AuthResponse>(
//         `/api/login`,
//         formData
//       );

//       if (response.data.token) {
//         localStorage.setItem("authToken", response.data.token);
//         setMessage("Login successful!");
//         router.push("/Main");
//       }
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         setMessage(error.message);
//       } else {
//         setMessage("Login failed");
//       }
//     }
//   };

//   const handleGoogleSuccess = async (
//     credentialResponse: CredentialResponse
//   ) => {
//     if (!credentialResponse.credential) {
//       setMessage("Google Signup failed: No credential received.");
//       return;
//     }

//     try {
//       const response = await axios.post<{ token?: string }>(
//         `${API_URL}/api/google-auth`,
//         { token: credentialResponse.credential }
//       );

//       if (response.data.token) {
//         localStorage.setItem("authToken", response.data.token);
//         setMessage("Google Signup successful! Redirecting...");
//         // router.push("/FinancialOffer");
//       }
//     } catch {
//       setMessage("Google Signup failed");
//     }
//   };
// return (
//   <form  className="w-full max-w-md min-w-[320px] mx-auto my-12 bg-white p-8 rounded-lg shadow-md space-y-4"
//     onSubmit={handleSubmit}>
      
//       <h2 className="text-xl font-bold text-center text-Red">Login</h2>
      
//       <div className="relative w-full">
//         <input className="peer w-[370px] border-Blue border-2 px-3 pt-5 pb-1 text-xs font-sans serif"
//           type="text" name="name" value={formData.name} onChange={handleChange} required
//         />
//         <label className="absolute left-3 top-1 text-xs text-black font-medium font-sans serif">Name</label>
//       </div>

//       <div className="relative w-full">
//         <input className="peer w-[370px] border-Blue border-2 px-3 pt-5 pb-1 text-xs font-sans serif"
//           type="password" name="password" value={formData.password} onChange={handleChange} required
//         />
//         <label className="absolute left-3 top-1 text-xs text-black font-medium font-sans serif">Password</label>
//       </div>

//       <div className="flex justify-end w-full text-xs">
//         <Link href="/Forgot-Password" className="text-black hover:text-Blue px-4 font-sans serif">
//           Forgot Password?
//         </Link>
//       </div>

//       <div className="text-center">
//         <button className="w-64 border-1 -mt-4 font-sans serif text-white bg-Red text-xs font-semibold py-2 rounded hover:bg-Red" 
//          type="submit">
//           Login          
//         </button>
 
//       {message && (<p className="py-5 text-center text-sm text-Red">{message}</p>)}

// <div className="mt-6">
  
//   {/* Divider line */}
//   <div className="flex items-center justify-center my-2">
//     <hr className="w-1/4 border-gray" />
//     <span className="px-2 text-xs font-sans serif font-semibold text-gray">OR</span>
//     <hr className="w-1/4 border-gray" />
//   </div>

//   <h6 className="text-xs font-sans serif">Don&apos;t have an account yet?</h6>
//   <Link href="/signup" className="block text-sm font-sans serif text-Red hover:text-Blue font-bold">
//     Signup
//   </Link>
// </div>
//    </div>
//    <GoogleLoginButton onSuccess={handleGoogleSuccess} onFailure={() => setMessage("Google authentication failed")}/>
//     </form>
//  );};
// export default Login;