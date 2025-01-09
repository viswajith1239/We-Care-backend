


export interface IAuthService {
    signup(userData: {name: string;email: string;phone: string;password: string;confirmpassword: string;}): Promise<{token:string}>;
    // otpCheck(otp: string, token: string): Promise<{valid:boolean}>;
    
    
 };