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
    dashboardData
}) {
    const [consolidatedData, setConsolidatedData] = useState({});
    const [appArray, setAppArray] = useState({});
    useEffect(() => {
        let temp = {};
        let tempAppArray = {};
        dashboardData?.forEach((data) => {
            temp[data.APP_ID + ':' + data.CNTRL_ID] = data;
            tempAppArray[data.APP_ID] = data;
        });
        setConsolidatedData(temp);
        setAppArray(tempAppArray);
    }, [dashboardData])

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

    useEffect(() => {
        console.log(filteredApps, filteredControls)
    }, [filteredApps, filteredControls])

    return (
        <div className={styles.tableContainer}>
            {
                allowedControlIndices.map((control, index) =>
                    <span key={index}>{index}</span>
                )
            }
            <table>
                <thead>
                    <tr>
                        {
                            columnNames?.map((colName, index) =>
                                indicesToShow.includes(index) && ![columnNames?.length - 1, columnNames?.length - 2].includes(index) &&
                                (allowedControlIndices.length === 0 || allowedControlIndices.includes(index)) && (
                                    index === 0 || (!dateFilter || filteredControls.has(colName))
                                ) && (
                                    <th key={index}>
                                        {colName}
                                    </th>
                                )
                            )
                        }
                    </tr>
                    <tr>
                        {
                            frequencyRow?.map((freq, index) =>
                                indicesToShow.includes(index) && ![frequencyRow?.length - 1, frequencyRow?.length - 2].includes(index) && (allowedControlIndices.length === 0 || allowedControlIndices.includes(index)) && (
                                    index === 0 || (!dateFilter || filteredControls.has(columnNames[index]))
                                ) &&
                                <th key={index}>{freq}</th>
                            )
                        }
                    </tr>
                    <tr>
                        {
                            riskRow?.map((risk, index) =>
                                indicesToShow.includes(index) && ![riskRow?.length - 1, riskRow?.length - 2].includes(index) && (allowedControlIndices.length === 0 || allowedControlIndices.includes(index)) && (
                                    index === 0 || (!dateFilter || filteredControls.has(columnNames[index]))
                                ) &&
                                <th key={index}>{risk}</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        tableBody?.map((row, index) =>
                            row &&
                            (regionFilter.length === 0 || regionFilter.includes(row[row.length - 2])) && (!soxInScope || row[row.length - 1] === 'Y') &&
                            (isClicked.length === 0 || handleStatusCheck(row)) &&
                            (appSearch == "" || row[0].toLowerCase().includes(appSearch.toLowerCase())) &&
                            (allowedApps.length === 0 || row[0] in allowedApps) && (
                                !dateFilter || (filteredApps.has(row[0]))
                            ) && (appArray.hasOwnProperty(row[0])) && (
                                <tr key={index}>
                                    {
                                        row.map((cell, tdIndex) =>
                                            indicesToShow.includes(tdIndex) && ![frequencyRow?.length - 1, frequencyRow?.length - 2].includes(tdIndex) && (allowedControlIndices.length === 0 || allowedControlIndices.includes(tdIndex)) && (
                                                tdIndex === 0 || (!dateFilter || filteredControls.has(columnNames[tdIndex]))
                                            ) &&
                                            (
                                                <td key={tdIndex}>
                                                    {
                                                        <div style={tdStyles}>
                                                            {
                                                                cell && cell !== 'NAN' && (
                                                                    <div onClick={() => {
                                                                        tdIndex === 0 && handleAppClick(cell);
                                                                        !madatoryRows.includes(tdIndex) && handleUpdateStatus(row[0], columnNames[tdIndex])
                                                                    }}
                                                                        style={tdIndex !== 0 ? tableCell(consolidatedData[`${row[0]}:${columnNames[tdIndex]}`] && consolidatedData[`${row[0]}:${columnNames[tdIndex]}`]['PROCESS_STATUS'], `${row[0]}:${columnNames[tdIndex]}`) : {}}>
                                                                        {madatoryRows.includes(tdIndex) && cell}
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