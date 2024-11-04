import axios from "axios";
import { useEffect, useState } from "react";
import StatusTable from "@/components/StatusTable";
import FilterSection from "./FilterSection";
import styles from "@/styles/index.module.css"
import Navbar from "@/components/Navbar";
import { decrypt } from "../api/auth/lib";

export default function Home({ data, report, userData }) {
    const [startDate, setStartDate] = useState(new Date());
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

    const [allApplicationData, setAllApplicationData] = useState([]);

    const [dashboardData, setDashboardData] = useState([]);
    useEffect(() => {
        let keyControlData_temp = {};
        data?.all_key_controls?.forEach((control) => {
            let CNTRL_ID = control[0]
            let KEY_CNTRL = control[7]
            let RISK_RATING = control[8]
            let CNTRL_FREQUENCY = control[2]
            keyControlData_temp[CNTRL_ID] = {
                CNTRL_ID: CNTRL_ID,
                RISK_RATING: RISK_RATING,
                CNTRL_FREQUENCY: CNTRL_FREQUENCY,
                KEY_CNTRL: KEY_CNTRL == 'Y' ? 'Y' : 'N',
            };
        });

        let soxInScope_temp = {}
        data?.all_apps_metadata?.forEach((app) => {
            let APP_ID = app[0]
            let REGION_ID = app[1]
            let SOX_IN_SCOPE = app[5]
            soxInScope_temp[APP_ID] = {
                APP_ID: APP_ID,
                REGION_ID: REGION_ID,
                SOX_IN_SCOPE: SOX_IN_SCOPE,
            };
        });

        let temp = [];

        data?.all_controls?.forEach((control) => {
            let object = {
                APP_ID: '',
                CNTRL_ID: '',
                REGION_ID: '',
                PROCESS_STATUS: '',
                CNTRL_FREQUENCY: '',
                KEY_CNTRL: '',
                RISK_RATING: '',
                SOX_IN_SCOPE: '',
                SCHEDULED_DATE: ''
            };
            object.APP_ID = control[0];
            object.REGION_ID = control[1];
            object.CNTRL_ID = control[2];
            object.SCHEDULED_DATE = control[4];
            object.PROCESS_STATUS = control[9];
            if (keyControlData_temp.hasOwnProperty(control[2])) {
                object.KEY_CNTRL = keyControlData_temp[control[2]].KEY_CNTRL;
                object.CNTRL_FREQUENCY = keyControlData_temp[control[2]].CNTRL_FREQUENCY;
                object.RISK_RATING = keyControlData_temp[control[2]].RISK_RATING;
            }
            if (soxInScope_temp.hasOwnProperty(control[0])) {
                object.SOX_IN_SCOPE = soxInScope_temp[control[0]].SOX_IN_SCOPE;
            }
            temp.push(object);
        });
        setDashboardData(temp);
    }, [data])

    useEffect(() => {
        setAllApplicationData(data?.all_applications);
    }, [data])

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
                userData={userData}
                dashboardData={dashboardData}
                startDate={startDate}
                setStartDate={setStartDate}
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
                userData={userData}
                allApplicationData={allApplicationData}
                dashboardData={dashboardData}
                startDate={startDate}
                setStartDate={setStartDate}
            />
        </div>
    );
}

export async function getServerSideProps(context) {
    const { req, res } = context;
    const token = req?.cookies['token']
    const payload = await decrypt(token)
    if (!payload || payload === null || payload === undefined) {
        res.setHeader('Set-Cookie', [
            'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;',
        ]);
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }
    console.log("payload =>", payload);

    let dashboard = {};
    try {
        dashboard = await axios.get("http://localhost:75/dashboard-data");
    } catch (error) {
        dashboard = {
            data: {},
        }
    }

    let report = {};
    try {
        report = await axios.get(`http://localhost:75/report`);
    } catch (error) {
        report = {
            data: {},
        }
    }

    try {
        return {
            props: {
                data: dashboard?.data || {},
                report: report?.data || {},
                userData: payload
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                data: {},
                report: {},
                userData: payload
            }
        }
    }
}