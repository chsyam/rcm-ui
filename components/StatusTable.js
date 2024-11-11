import { useEffect, useState } from "react";
import styles from "./../styles/index.module.css";
import { useRouter } from "next/router";

export default function StatusTable({
    columnNames,
    frequencyRow,
    riskRow,
    tableBody,
    reportData,
    regionFilter,
    soxInScope,
    periodicFilter,
    transactionalFilter,
    periodicIndices,
    transactionalIndices,
    keyControl,
    keyControlIndices,
    isClicked,
    madatoryRows,
    appSearch,
    userFilter,
    allControls,
    dateFilter,
    userData,
    allApplicationData,
    dashboardData,
    startDate,
    setStartDate,
    appControlsData,
    matchingAppCntrlData,
    appRegions,
    allAppsDefn,
    userName
}) {
    const [consolidatedData, setConsolidatedData] = useState({});
    const [appArray, setAppArray] = useState({});
    const [currentMonthYear, setCurrentMonthYear] = useState("");

    useEffect(() => {
        let date = new Date(startDate);
        setCurrentMonthYear(String(date.getMonth() + 1).padStart(2, '0') + date.getFullYear());
    }, [startDate, setStartDate])

    useEffect(() => {
        let temp = {};
        let tempAppArray = {};
        appControlsData?.forEach((data) => {
            let scheduled_date = new Date(data.SCHEDULED_DATES);
            let fomattedDate = String(scheduled_date.getMonth() + 1).padStart(2, '0') + scheduled_date.getFullYear();
            temp[data.APP_ID + ':' + data.CNTRL_ID + ':' + fomattedDate] = data;
            tempAppArray[data.APP_ID + ':' + data.REGION_ID + ':' + data.CNTRL_ID + ':' + fomattedDate] = data;
        });
        setConsolidatedData(temp);
        setAppArray(tempAppArray);
    }, [appControlsData])

    const [indicesToShow, setIndicesToShow] = useState([]);
    const router = useRouter();
    const [username, setUsername] = useState(userData?.username)
    const [allowedControls, setAllowedControls] = useState([]);
    const [allowedControlIndices, setAllowedControlIndices] = useState([]);
    const [allowedApps, setAllowedApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState(new Set())
    const [filteredControls, setFilteredControls] = useState(new Set())

    useEffect(() => {
        function handleIndices() {
            let indices = [0, tableBody[0]?.length - 1, tableBody[0]?.length - 2];
            if ((periodicFilter && transactionalFilter) || (!periodicFilter && !transactionalFilter)) {
                if (keyControl) {
                    indices = indices.concat(keyControlIndices);
                    return indices;
                }
                indices = indices.concat(periodicIndices, transactionalIndices);
                return indices;
            } if (periodicFilter) {
                indices = indices.concat(periodicIndices);
            } if (transactionalFilter) {
                indices = indices.concat(transactionalIndices);
            } if (keyControl) {
                let finalIndices = [0, tableBody[0].length - 1, tableBody[0].length - 2];
                indices.map((index) => {
                    if (keyControlIndices.includes(index)) {
                        finalIndices.push(index);
                    }
                })
                return finalIndices;
            }
            return indices;
        }
        setIndicesToShow(handleIndices());
    }, [periodicFilter, transactionalFilter, periodicIndices, transactionalIndices, tableBody, keyControl, keyControlIndices, userFilter, dateFilter, reportData])

    useEffect(() => {
        if (userFilter) {
            if (username in allControls) {
                setAllowedApps(allControls[username])
            }
        } else {
            setAllowedApps([]);
        }
    }, [allControls, userFilter, username])

    useEffect(() => {
        let temp = [];
        for (let app in allowedApps) {
            temp = temp + allowedApps[app]
        }
        setAllowedControls(temp);
    }, [allowedApps])

    useEffect(() => {
        let temp = [0];
        if (userFilter) {
            columnNames.map((col, index) => {
                allowedControls.includes(col) && temp.push(index);
            })
            setAllowedControlIndices(temp);
        } else {
            setAllowedControlIndices([])
        }
    }, [allowedApps, allowedControls, columnNames, userFilter])

    const [validIndices, setValidIndices] = useState([]);

    useEffect(() => {
        let tempCntrls = [];
        appControlsData.map((app) => {
            if (app["OWNER"] === username) {
                tempCntrls.push(app['CNTRL_ID']);
            }
        })

        let tempIndices = [];
        columnNames.map((column, index) => {
            if (tempCntrls.includes(column)) {
                tempIndices.push(index);
            }
        })
        setValidIndices([0, ...tempIndices]);
    }, [appControlsData, columnNames, username])

    function tableCell(cellValue, status) {
        return (
            {
                height: '30px',
                width: '30px',
                backgroundColor:
                    (isClicked.length === 0 || isClicked.includes(cellValue)) ?
                        cellValue === 'Updated' || cellValue === 'Update' ? 'green' :
                            cellValue === 'Inprog' ? 'yellow' :
                                cellValue === 'Schedule' ? 'blue' :
                                    cellValue === 'Overdue' ? 'red' : '' : '',
                borderRadius: '50%'
            }
        )
    }

    const tdStyles = {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer"
    };

    const handleStatusCheck = (row) => {
        if (isClicked.length === 0) {
            return true;
        }
        for (let i = 0; i < row.length; i++) {
            if (isClicked.includes(row[i])) {
                return true;
            }
        }
        return false;
    }

    const handleAppClick = (appName) => {
        router.push({
            pathname: `getdata/`, query: {
                APP_ID: appName
            }
        })
    }

    const handleUpdateStatus = (APP_ID, CNTRL_ID) => {
        router.push({
            pathname: `update/`, query: {
                APP_ID: APP_ID,
                CNTRL_ID: CNTRL_ID
            }
        })
    }

    useEffect(() => {
        function handleDateChange() {
            let tempApps = new Set();
            let tempControlFilters = new Set();
            reportData.map((row) => {
                const modifiedDate = new Date(row[15]);
                const serverMonthYear = `${modifiedDate.getFullYear()}-${(modifiedDate.getMonth() + 1).toString().padStart(2, '0')}`;
                if (serverMonthYear === dateFilter) {
                    tempApps.add(row[0])
                    tempControlFilters.add(row[2])
                }
            })
            return {
                "apps": tempApps,
                "controls": tempControlFilters
            }
        }
        if (dateFilter) {
            const res = handleDateChange()
            setFilteredApps(res.apps)
            setFilteredControls(res.controls)
        }
    }, [dateFilter, reportData])

    const validateCell = (row, tdIndex) => {
        return (matchingAppCntrlData.hasOwnProperty(row) && matchingAppCntrlData[row][row + ':' + columnNames[tdIndex]]) ? matchingAppCntrlData[row][row + ':' + columnNames[tdIndex]]['PROCESS_STATUS'] : false
    }

    return (
        <div className={styles.tableContainer}>
            <table>
                <thead>
                    <tr>
                        {
                            columnNames?.map((colName, index) =>
                                indicesToShow.includes(index) &&
                                ![columnNames?.length - 1, columnNames?.length - 2].includes(index) &&
                                (!userFilter || (userFilter && validIndices.includes(index))) &&
                                (index === 0 || (!dateFilter || filteredControls.has(colName))) &&
                                <th key={index}>{colName}</th>
                            )
                        }
                    </tr>
                    <tr>
                        {
                            frequencyRow?.map((freq, index) =>
                                indicesToShow.includes(index) &&
                                ![frequencyRow?.length - 1, frequencyRow?.length - 2].includes(index) &&
                                (!userFilter || (userFilter && validIndices.includes(index))) &&
                                (index === 0 || (!dateFilter || filteredControls.has(columnNames[index]))) &&
                                <th key={index}>{freq}</th>
                            )
                        }
                    </tr>
                    <tr>
                        {
                            riskRow?.map((risk, index) =>
                                indicesToShow.includes(index) &&
                                ![riskRow?.length - 1, riskRow?.length - 2].includes(index) &&
                                (!userFilter || (userFilter && validIndices.includes(index))) &&
                                (index === 0 || (!dateFilter || filteredControls.has(columnNames[index]))) &&
                                <th key={index}>{risk}</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        Object.keys(matchingAppCntrlData)?.map((row, index) =>
                            row
                            && (regionFilter.length === 0 || regionFilter.includes(appRegions[row]))
                            && (!soxInScope || allAppsDefn[row]?.SOX_IN_SCOPE === 'Y')
                            // && (isClicked.length === 0 || handleStatusCheck(row))
                            && (appSearch == "" || row.toLowerCase().includes(appSearch.toLowerCase()))
                            // && (allowedApps.length === 0 || row.APP_ID in allowedApps)
                            && (!dateFilter || (filteredApps.has(row)))
                            && (
                                <tr key={index}>
                                    {
                                        Array.from({ length: columnNames.length }, (_, tdIndex) => tdIndex).map((tdIndex) =>
                                            indicesToShow.includes(tdIndex) &&
                                            ![frequencyRow?.length - 1, frequencyRow?.length - 2].includes(tdIndex) &&
                                            (!userFilter || (userFilter && validIndices.includes(tdIndex))) &&
                                            (
                                                <td key={tdIndex}>
                                                    {
                                                        <div style={tdStyles}>
                                                            {
                                                                (tdIndex === 0 || appArray.hasOwnProperty(row + ':' + appRegions[row] + ':' + columnNames[tdIndex] + ':' + currentMonthYear)) &&
                                                                (
                                                                    <div onClick={() => {
                                                                        tdIndex === 0 && handleAppClick(row);
                                                                        !madatoryRows.includes(tdIndex) && handleUpdateStatus(row, columnNames[tdIndex])
                                                                    }}
                                                                        style={tdIndex !== 0 ? tableCell(validateCell(row, tdIndex) && validateCell(row, tdIndex), `${row}:${columnNames[tdIndex]}:${currentMonthYear}`) : {}}>
                                                                        <div style={{ fontSize: '10px' }}>
                                                                        </div>
                                                                        {madatoryRows.includes(tdIndex) && row}
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    }
                                                </td>
                                            )
                                        )
                                    }
                                </tr>
                            )
                        )
                    }
                </tbody>
            </table>
        </div >
    );
}