import * as admin from 'firebase-admin';

export const registerUser = async (email: string, password: string) => {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    return userRecord;
  } catch (error: any) {
    throw new Error('Error registering user: ' + error.message);
  }
};

export const loginUser = async (email: string) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    return user;
  } catch (error: any) {
    throw new Error('Error logging in: ' + error.message);
  }
};

export const verifyEmail = async (userId: string) => {
  try {
    await admin.auth().generateEmailVerificationLink(userId);
  } catch (error: any) {
    throw new Error('Error verifying email: ' + error.message);
  }
};
