import React from "react";
import Modal from "./Modal";

const Profile = () => {
  return (
    <Modal
      onClose={function (): void {
        throw new Error("Function not implemented.");
      }}
      open={false}
    >
      Settings
    </Modal>
  );
};

export default Profile;
