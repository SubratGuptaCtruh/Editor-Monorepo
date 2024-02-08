import styles from "./ChangePassword.module.css";

const ChangePassword = () => {
    return (
        <div className={styles.PasswordContainer}>
            <h4>Change Password</h4>
            <p>This will be required to login with your username or email ID.</p>
            <label htmlFor="">OLD PASSWORD</label>
            <input type="text" />
            <label htmlFor="">NEW PASSWORD</label>
            <input type="text" />
            <div className={styles.buttoContainer} style={{ display: "flex", gap: "10px" }}>
                <button>UPDATE</button>
                <button>FORGOT PASSWORD</button>
            </div>
        </div>
    );
};

export default ChangePassword;
