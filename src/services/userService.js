import { account } from '../lib/appwrite';

class UserService {
  // Update user name
  async updateName(name) {
    try {
      return await account.updateName(name);
    } catch (error) {
      console.error('Update name error:', error);
      throw error;
    }
  }

  // Update user email
  async updateEmail(email, password) {
    try {
      return await account.updateEmail(email, password);
    } catch (error) {
      console.error('Update email error:', error);
      throw error;
    }
  }

  // Update user password
  async updatePassword(newPassword, oldPassword) {
    try {
      return await account.updatePassword(newPassword, oldPassword);
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
