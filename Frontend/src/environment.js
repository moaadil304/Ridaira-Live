//  for production
let IS_PROD = true;
const server = IS_PROD
  ? "https://ridaira-live-backend.onrender.com"
  : "http://localhost:8000"; 

// for local machine
// let IS_PROD = false;
// const server = "http://localhost:8000";
 


export default server;