import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env.mjs';
import isEqual from 'lodash/isEqual';
import { pagesOptions } from './pages-options';
import axios from 'axios';
import CryptoJS from 'crypto-js';

export const authOptions: NextAuthOptions = {
  // debug: true,
  pages: {
    ...pagesOptions,
  },
  // session: {
  //   strategy: 'jwt',
  //   maxAge: 30 * 24 * 60 * 60, // 30 days
  // },
  callbacks: {
    async session({ session, token }) {
      console.log(token)
      if (token) {
        session.user.id = token.id;
        session.user.token = token.token;
      }
      return session;
    },
    async jwt({ token, user }) {
      // if (user) {
      //   // return user as JWT
      //   // console.log(user.data.Token)
      //   // token = user.data.Token;
      //   // console.log(user.data)
      //   // console.log(token)
      //   token.user = user.data.Token;
      //   token = user.data.Token;
      //   // console.log(token.user)
      //   console.log("Token user", token.user)
      // }
      // return token;
      if (user) {
        // token.id = user.UserId;
        token.token = user.Token;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // const parsedUrl = new URL(url, baseUrl);
      // if (parsedUrl.searchParams.has('callbackUrl')) {
      //   return `${baseUrl}${parsedUrl.searchParams.get('callbackUrl')}`;
      // }
      // if (parsedUrl.origin === baseUrl) {
      //   return url;
      // }
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        mobile: {label: 'Mobile', type: 'text'},
        password: {label: 'Password', type: 'password'},
        lpassword: {label: 'LPassword', type: 'password'}
      },
      async authorize(credentials: any) {
        // console.log("called auth option")

        const encryptedApiRequest = {
          "EncryptRequestData": ""
        }
        const login_api_req = {
          Action: "Admin",
          UserId: 1,
          Mobile: credentials.mobile,
          Password: credentials.password,
          LPassword: credentials.lpassword,
          IpAddress: "",
          Source: 1,
          Otp: "",
          Latitude: 26.7976704,
          Longitude: 75.8185984
        }
        

        const key = CryptoJS.enc.Utf8.parse('!s@P!a#c$e!a$a!e');
        const iv = CryptoJS.enc.Utf8.parse('!s@P!a#c$e!a$a!e');
        const encryptData = (data: any, key: any) => {
          const encryptedData = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          });
          return encryptedData.toString();
        };
        const aesEncrypt = (data: any) => {
          const jsonData: string = data.toString();
          return encryptData(jsonData, key)
        }
        encryptedApiRequest.EncryptRequestData = aesEncrypt(JSON.stringify(login_api_req));
        const res = await axios.post('https://wino.spacesoftech.com/Admin/Home/login',encryptedApiRequest)
        // console.log(res)
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid
        const user: any = res.data;
        // console.log(user)

        if (
          user && user.Token
        ) {
          // console.log(user)
          return user as any;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
};
