// This component is a placeholder for the Profile modal.
// It currently does not implement any functionality or state management.
// You can add state management, form handling, and other features as needed.
// For example, you might want to fetch user data and display it here.
// You can also add a close handler to the modal.
// For now, it simply returns a modal with static content.
// Note: The onClose function is currently throwing an error, which you may want to implement later.
// The modal is set to open false by default, you can change this based on your application state.
// You can also pass props to customize the modal's behavior and content.

import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import {
    changeUserPassword, infoUser,
    isAccessTokenValid,
    type PasswordChangeRequest,
    requestUserLogout,
    type UserInfoResponse
} from "./authApi.ts";
import {validatePasswords} from "./authValidation.ts";
import TextInput from "../components/TextInput.tsx";
import AuthAlert from "../components/AuthAlert.tsx";
import Button from "../components/Button.tsx";
import Form from "../components/Form.tsx";
import {useAuth} from "./AuthProvider.tsx";

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
}

const DEFAULT_PASSWORDS_VALUES = {
    currentPassword: "",
    password: "",
    confirmPassword: "",
};

const ProfileModal = ({
    open,
    onClose
}: ProfileModalProps) => {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [initialValues] = useState(DEFAULT_PASSWORDS_VALUES)
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const { setAuthenticated } = useAuth();

  const handleSubmit = async ({
      currentPassword,
      password
  }: typeof initialValues) => {
      try {
          setServerError("");
          setSuccessMessage("");

          const token = await isAccessTokenValid();

          if (token) {
            const payload =
                {
                    current_password: currentPassword,
                    new_password: password
                } as PasswordChangeRequest;

            const result = await changeUserPassword(payload);
            setSuccessMessage(result || "Password successfully changed.");
          } else {
            setServerError("You are currently not signed in.");
          }
      } catch (err: any) {
          console.error("Password change failed:", err.message);
          setServerError(err.message);
      }
  };

  const logoutUser = async () => {
      try {
          setServerError("")
          setSuccessMessage("")

          const token = await isAccessTokenValid();

          if (token) {
              const result = await requestUserLogout();
              setAuthenticated(false);
              setSuccessMessage(result || "Successfully logged out");
              onClose();
          } else {
              setServerError("You are currently not signed in.");
          }
      } catch (err: any) {
          console.error("User logout failed:", err.message);
          setServerError(err.message);
      }
  };

  useEffect(() => {
      const fetchUserInfo = async () => {
          try {
              const token = await isAccessTokenValid();

              if (token) {
                  const info = await infoUser();
                  if (info) {
                      const createDate = new Date(info.creation_date);
                      const loginDate = new Date(info.last_login);

                      const formatted = new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short"
                      })

                      info.creation_date = formatted.format(createDate);
                      info.last_login = formatted.format(loginDate);

                      setUserInfo(info);
                  }
              }
              return;
          } catch (error: any) {
              console.log(error.message)
          }
      };

      fetchUserInfo();

      if (!open) {
          setServerError("");
          setSuccessMessage("");
      }
  }, [open]);

  return (
      <Modal onClose={onClose} open={open} style={{ width: "90%", maxWidth: "800px", overflow: "visible" }}>
          <div className="d-flex flex-row gap-4" style={{maxWidth: "800px"}}>
              <div className="border-end pe-4">
                  <h4>User Profile</h4>
                  {userInfo ? (
                      <div>
                          <p><strong>Username:</strong> {userInfo.username}</p>
                          <p><strong>Email:</strong> {userInfo.email}</p>
                          <p><strong>Total Predictions:</strong> {userInfo.total_predictions}</p>
                          <p><strong>Prediction History Size:</strong> {userInfo.prediction_history_size}</p>
                          <p><strong>Last Login:</strong> {userInfo.last_login}</p>
                          <p><strong>Creation Date:</strong> {userInfo.creation_date}</p>
                      </div>
                  ) : (
                      <p>Loading user info...</p>
                  )}
                  <Button className="btn-sm btn-danger" onClick={logoutUser}>
                      Logout
                  </Button>
              </div>

              <div className="flex-grow-1">
                  <Form
                      onSubmit={handleSubmit}
                      validate={(values) => validatePasswords({...values})}
                      initialValues={initialValues}
                      submitBtnLabel="Update Password"
                  >
                      <p className="h1 mb-3 fw-bold text-center pb-2">Update Password</p>

                      <TextInput
                          name="currentPassword"
                          type="password"
                          label="Current Password"
                          placeholder="Current Password"
                      />

                      <TextInput
                          name="password"
                          type="password"
                          label="Password"
                          placeholder="Password"
                      />

                      <TextInput
                          name="confirmPassword"
                          type="password"
                          label="Confirm Password"
                          placeholder="Confirm Password"
                      />
                      <AuthAlert error={serverError} success={successMessage}/>
                  </Form>
              </div>
          </div>
      </Modal>
  );
};

export default ProfileModal;
