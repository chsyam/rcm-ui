import { useState } from "react";
import styles from "./../../styles/Filters.module.css"
import { FaRegUser } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FilterSection({
    setRegionFilter,
    regionFilter,
    setSoxInScope,
    soxInScope,
    setPeriodicFilter,
    periodicFilter,
    setTransactionalFilter,
    transactionalFilter,
    keyControl,
    setKeyControl,
    isClicked,
    setIsClicked,
    appSearch,
    setAppSearch,
    userFilter,
    setUserFilter,
    dateFilter,
    setDateFilter,
    startDate,
    setStartDate
}) {
    const handleRegionFiletr = (regionName) => {
        if (regionFilter.includes(regionName)) {
            setRegionFilter(regionFilter.filter(item => item !== regionName));
        } else {
            setRegionFilter([...regionFilter, regionName]);
        }
    }

    const handleSoxInScope = () => {
        setSoxInScope(!soxInScope);
    }

    const handlePeriodicFilter = () => {
        setPeriodicFilter(!periodicFilter);
    }

    const handleTransactionalFilter = () => {
        setTransactionalFilter(!transactionalFilter);
    }

    const handleKeyControl = () => {
        setKeyControl(!keyControl);
    }

    const handleAppStatus = (status) => {
        if (isClicked?.includes(status)) {
            setIsClicked(isClicked.filter(item => item !== status));
        } else {
            setIsClicked([...isClicked, status]);
        }
    }

    return (
        <div className={styles.filterSection}>
            <div className={styles.filterButtons}>
                <div
                    style={regionFilter.includes("APAC") ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleRegionFiletr("APAC")}
                >APAC</div>
                <div
                    style={regionFilter.includes("EMEA") ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleRegionFiletr("EMEA")}
                >EMEA</div>
                <div
                    style={regionFilter.includes("LATAM") ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleRegionFiletr("LATAM")}
                >LATAM</div>
                <div
                    style={regionFilter.includes("NAMER") ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleRegionFiletr("NAMER")}> NA</div>
                <div
                    style={soxInScope ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleSoxInScope()}
                >SOX IN SCOPE</div>
                <div
                    style={transactionalFilter ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleTransactionalFilter()}
                >Transactional</div>
                <div
                    style={periodicFilter ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handlePeriodicFilter()}
                >Periodic</div>
                <div
                    style={keyControl ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleKeyControl()}
                >Key Control</div>
            </div>
            <div className={styles.filterButtons}>
                <div onClick={() => setUserFilter(!userFilter)}>
                    <FaRegUser /><br />
                </div>
                {userFilter.toString()}
                <div className={styles.filter}
                    style={isClicked?.includes("Overdue") ? { backgroundColor: '#FFF', border: '2px solid red', color: 'red' } : { backgroundColor: "red" }}
                    onClick={() => handleAppStatus("Overdue")}
                >Overdue</div>
                <div className={styles.filter}
                    style={isClicked?.includes("Inprog") ? { backgroundColor: '#FFF', border: '2px solid yellow', color: '#000' } : { backgroundColor: "yellow" }}
                    onClick={() => handleAppStatus("Inprog")}
                >Inprogress</div>
                <div className={styles.filter}
                    style={isClicked?.includes("Updated") ? { backgroundColor: '#FFF', border: '2px solid green', color: 'green' } : { backgroundColor: "green" }}
                    onClick={() => handleAppStatus("Updated")}
                >Updated</div>
                <div className={styles.filter}
                    style={isClicked?.includes("Schedule") ? { backgroundColor: '#FFF', border: '2px solid blue', color: 'blue' } : { backgroundColor: "blue" }}
                    onClick={() => handleAppStatus("Schedule")}
                >Scheduled</div>
            </div>
            <div>
                <input type="text" name="appSearch" value={appSearch} onChange={(e) => { setAppSearch(e.target.value) }} placeholder="Application Search" className={styles.search} />
            </div>
            <div style={{ zIndex: 1000 }}>
                <DatePicker className={styles.calendar} dateFormat="MMMM, yyyy" selected={startDate} onChange={(date) => setStartDate(date)} showMonthYearPicker />
            </div>
        </div>
    )
}