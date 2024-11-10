import DatePicker from "react-datepicker";
import styles from "./TitleBar.module.css";
import "react-datepicker/dist/react-datepicker.css";

export default function TitleBar({ startDate, setStartDate, appSearch, setAppSearch }) {
    return (
        <div className={styles.titleBarContainer}>
            <div></div>
            <div className={styles.pageTitle}>
                WPP OSPREY RISK & CONTROL MATRIX - DASHBOARD
            </div>
            <div className={styles.fileterMenu}>
                <div>
                    <input type="text" name="appSearch" value={appSearch} onChange={(e) => { setAppSearch(e.target.value) }} placeholder="App Search" className={styles.search} />
                </div>
                <div style={{ zIndex: 1000 }}>
                    <DatePicker className={styles.calendar} dateFormat="MMMM, yyyy" selected={startDate} onChange={(date) => setStartDate(date)} showMonthYearPicker />
                </div>
            </div>
        </div>
    );
}