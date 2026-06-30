import {

  apiForgotPassword,

  apiGetMe,

  apiLogin,

  apiLogout,

  apiRegister,

  apiResetPassword,

  type ApiUser,

} from "@/services/apiAuthService";

import {

  createAddressApi,

  deleteAddressApi,

  getAddressesApi,

  updateAddressApi,

  type ApiAddress,

} from "@/services/addressApiService";

import { getProfileApi, updateProfileApi } from "@/services/profileApiService";

import { notifyAuthSessionChanged } from "@/services/authSession";



export interface SessionUser {

  uid: string;

  email: string;

  displayName: string | null;

  photoURL?: string | null;

}



export interface UserAddress {

  id?: string;

  name: string;

  phone: string;

  address: string;

  city: string;

  state: string;

  pincode: string;

  isDefault?: boolean;

}



export interface UserProfile {

  uid: string;

  email: string;

  displayName: string;

  phone?: string;

  photoURL?: string;

  addresses?: UserAddress[];

  role: "user" | "admin";

  createdAt?: string;

  updatedAt?: string;

}



const configuredAdminEmail = () =>

  import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase().trim() || "";



export function mapApiUserToSessionUser(apiUser: ApiUser): SessionUser {

  return {

    uid: apiUser.id,

    email: apiUser.email,

    displayName: apiUser.displayName,

    photoURL: apiUser.photoUrl,

  };

}



function mapApiAddressToUserAddress(apiAddress: ApiAddress): UserAddress {

  const address = apiAddress.addressLine2

    ? `${apiAddress.addressLine1}, ${apiAddress.addressLine2}`

    : apiAddress.addressLine1;



  return {

    id: apiAddress.id,

    name: apiAddress.fullName,

    phone: apiAddress.phone,

    address,

    city: apiAddress.city,

    state: apiAddress.state,

    pincode: apiAddress.pincode,

    isDefault: apiAddress.isDefault,

  };

}



function mapUserAddressToCreateRequest(

  address: UserAddress

): Parameters<typeof createAddressApi>[0] {

  return {

    fullName: address.name,

    phone: address.phone,

    addressLine1: address.address,

    city: address.city,

    state: address.state,

    pincode: address.pincode,

    country: "India",

    isDefault: address.isDefault,

  };

}



function mapUserAddressToUpdateRequest(

  address: UserAddress

): Parameters<typeof updateAddressApi>[1] {

  return {

    fullName: address.name,

    phone: address.phone,

    addressLine1: address.address,

    city: address.city,

    state: address.state,

    pincode: address.pincode,

    country: "India",

    isDefault: address.isDefault,

  };

}



export function mapApiUserToProfile(apiUser: ApiUser): UserProfile {

  return {

    uid: apiUser.id,

    email: apiUser.email,

    displayName: apiUser.displayName,

    phone: apiUser.phone ?? undefined,

    photoURL: apiUser.photoUrl ?? undefined,

    role: apiUser.role === "ADMIN" ? "admin" : "user",

    createdAt: apiUser.createdAt,

    updatedAt: apiUser.updatedAt,

  };

}



async function buildUserProfileFromApi(): Promise<UserProfile | null> {

  const [profile, addresses] = await Promise.all([

    getProfileApi(),

    getAddressesApi(),

  ]);



  return {

    uid: profile.id,

    email: profile.email,

    displayName: profile.displayName,

    phone: profile.phone ?? undefined,

    photoURL: profile.photoUrl ?? undefined,

    role: profile.role === "ADMIN" ? "admin" : "user",

    createdAt: profile.createdAt,

    updatedAt: profile.updatedAt,

    addresses: addresses.map(mapApiAddressToUserAddress),

  };

}



export const isAdminUser = (

  email: string | null | undefined,

  profile: UserProfile | null | undefined

): boolean => {

  if (profile?.role === "admin") return true;

  const adminEmail = configuredAdminEmail();

  return !!adminEmail && email?.toLowerCase() === adminEmail;

};



export const signUp = async (

  email: string,

  password: string,

  displayName: string

): Promise<UserProfile> => {

  try {

    await apiRegister(email, password, displayName);

    return await signIn(email, password);

  } catch (error) {

    console.error("Error signing up:", error);

    throw error;

  }

};



export const signIn = async (

  email: string,

  password: string

): Promise<UserProfile> => {

  try {

    await apiLogin(email, password);

    await notifyAuthSessionChanged();

    const profile = await buildUserProfileFromApi();

    if (!profile) {

      throw new Error("Failed to load user profile");

    }

    return profile;

  } catch (error) {

    console.error("Error signing in:", error);

    throw error;

  }

};



export const logout = async (): Promise<void> => {

  try {

    await apiLogout();

    await notifyAuthSessionChanged();

  } catch (error) {

    console.error("Error signing out:", error);

    throw error;

  }

};



export const getCurrentUser = async (): Promise<UserProfile | null> => {

  try {

    const apiUser = await apiGetMe();

    if (!apiUser) return null;

    return await buildUserProfileFromApi();

  } catch (error) {

    console.error("Error getting current user:", error);

    throw error;

  }

};



export const resetPassword = async (email: string): Promise<void> => {

  try {

    await apiForgotPassword(email);

  } catch (error) {

    console.error("Error sending password reset email:", error);

    throw error;

  }

};



export const confirmPasswordReset = async (

  email: string,

  otp: string,

  password: string

): Promise<void> => {

  try {

    await apiResetPassword(email, otp, password);

  } catch (error) {

    console.error("Error resetting password:", error);

    throw error;

  }

};



export const getUserProfile = async (_uid?: string): Promise<UserProfile | null> => {

  try {

    return await buildUserProfileFromApi();

  } catch (error) {

    console.error("Error getting user profile:", error);

    throw error;

  }

};



export const updateUserProfile = async (

  _uid: string,

  data: Partial<Pick<UserProfile, "displayName" | "phone" | "photoURL">>

): Promise<void> => {

  try {

    await updateProfileApi({

      displayName: data.displayName,

      phone: data.phone ?? null,

      photoUrl: data.photoURL ?? null,

    });

    await notifyAuthSessionChanged();

  } catch (error) {

    console.error("Error updating user profile:", error);

    throw error;

  }

};



export const addAddress = async (

  _uid: string,

  address: UserAddress

): Promise<void> => {

  try {

    await createAddressApi(mapUserAddressToCreateRequest(address));

    await notifyAuthSessionChanged();

  } catch (error) {

    console.error("Error adding address:", error);

    throw error;

  }

};



export const updateAddress = async (

  _uid: string,

  index: number,

  address: UserAddress

): Promise<void> => {

  try {

    const addresses = await getAddressesApi();

    const target = addresses[index];

    if (!target) return;



    await updateAddressApi(target.id, mapUserAddressToUpdateRequest(address));

    await notifyAuthSessionChanged();

  } catch (error) {

    console.error("Error updating address:", error);

    throw error;

  }

};



export const deleteAddress = async (

  _uid: string,

  index: number

): Promise<void> => {

  try {

    const addresses = await getAddressesApi();

    const target = addresses[index];

    if (!target) return;



    await deleteAddressApi(target.id);

    await notifyAuthSessionChanged();

  } catch (error) {

    console.error("Error deleting address:", error);

    throw error;

  }

};


