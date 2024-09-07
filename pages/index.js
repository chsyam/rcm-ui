import axios from "axios";
import { useEffect, useState } from "react";
import StatusTable from "@/components/StatusTable";
import FilterSection from "./FilterSection";
import styles from "@/styles/index.module.css"
import Navbar from "@/components/Navbar";

export default function Home({ data, report }) {
    const [isClicked, setIsClicked] = useState([]);
    const [madatoryRows, setMandatoryRows] = useState([]);
    const [appSearch, setAppSearch] = useState("");

    const [columnNames, setColumnNames] = useState([]);
    const [frequencyRow, setFrequencyRow] = useState([]);
    const [riskRow, setRiskRow] = useState([]);
    const [tableBody, setTableBody] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [keyControlRows, setKeyControlRows] = useState([]);
    const [allControls, setAllControls] = useState([]);
    const [userFilter, setUserFilter] = useState(false);

    const [regionFilter, setRegionFilter] = useState([]);
    const [soxInScope, setSoxInScope] = useState(false);
    const [periodicFilter, setPeriodicFilter] = useState(false);
    const [transactionalFilter, setTransactionalFilter] = useState(false);
    const [dateFilter, setDateFilter] = useState(false);

    const [periodicIndices, setPeriodicIndices] = useState([]);
    const [transactionalIndices, setTransactionalIndices] = useState([]);
    const [keyControlIndices, setKeyControlIndices] = useState([]);
    const [keyControl, setKeyControl] = useState(false);

    useEffect(() => {
        function handleAllControls() {
            let temp = {};
            data?.all_controls?.forEach((control) => {
                let username = control[12]
                let APP_ID = control[0]
                let CNTRL_ID = control[2]
                if (temp.hasOwnProperty(username)) {
                    temp[username][APP_ID].push(CNTRL_ID)
                } else {
                    temp[username] = { [APP_ID]: [CNTRL_ID] }
                };
            });
            setAllControls(temp)
        }
        handleAllControls()
        setColumnNames(data?.column_headings);
        setFrequencyRow(data?.frequency);
        setRiskRow(data?.risk);
        setTableBody(data?.records);
        setReportData(report[0]?.report)
        setKeyControlRows(data?.keys);
    }, [data, regionFilter, report, soxInScope])

    useEffect(() => {
        function handleIndices() {
            let periodicIndices = [];
            let transactionalIndices = [];
            let keyControlIndices = [];
            frequencyRow.forEach((cellValue, rowIndex) => {
                if (cellValue === "Trans") {
                    transactionalIndices.push(rowIndex);
                } else {
                    periodicIndices.push(rowIndex);
                }
            });
            keyControlRows.forEach((cellValue, rowIndex) => {
                if (cellValue === "Y") {
                    keyControlIndices.push(rowIndex);
                }
            });

            setPeriodicIndices(periodicIndices);
            setMandatoryRows([0, frequencyRow.length - 1, frequencyRow.length - 2]);
            setTransactionalIndices(transactionalIndices);
            setKeyControlIndices(keyControlIndices);
        }
        handleIndices();
    }, [frequencyRow, keyControlRows, tableBody])

    return (
        <div className={styles.bodyContainer}>
            <Navbar />
            <FilterSection
                setRegionFilter={setRegionFilter}
                regionFilter={regionFilter}
                setSoxInScope={setSoxInScope}
                soxInScope={soxInScope}
                setPeriodicFilter={setPeriodicFilter}
                periodicFilter={periodicFilter}
                setTransactionalFilter={setTransactionalFilter}
                transactionalFilter={transactionalFilter}
                setKeyControl={setKeyControl}
                keyControl={keyControl}
                isClicked={isClicked}
                setIsClicked={setIsClicked}
                appSearch={appSearch}
                setAppSearch={setAppSearch}
                userFilter={userFilter}
                setUserFilter={setUserFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
            />
            <StatusTable
                columnNames={columnNames}
                frequencyRow={frequencyRow}
                riskRow={riskRow}
                keyControlRows={keyControlRows}
                tableBody={tableBody}
                reportData={reportData}
                regionFilter={regionFilter}
                soxInScope={soxInScope}
                periodicFilter={periodicFilter}
                transactionalFilter={transactionalFilter}
                periodicIndices={periodicIndices}
                transactionalIndices={transactionalIndices}
                keyControl={keyControl}
                keyControlIndices={keyControlIndices}
                isClicked={isClicked}
                setIsClicked={setIsClicked}
                madatoryRows={madatoryRows}
                appSearch={appSearch}
                userFilter={userFilter}
                allControls={allControls}
                dateFilter={dateFilter}
            />
        </div>
    );
}

export async function getServerSideProps() {
    let dashboard = {};
    try {
        dashboard = await axios.get("http://localhost:75/dashboard-data");
    } catch (error) {
        dashboard = {
            data: {}
        }
    }

    let report = {};
    try {
        report = await axios.get(`http://localhost:75/report`);
    } catch (error) {
        report = {
            data: {}
        }
    }

    try {
        return {
            props: {
                data: dashboard?.data || {},
                report: report?.data || {}
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                data: {},
                report: {}
            }
        }
    }
}