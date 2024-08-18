import { useEffect, useState } from "react";
import styles from "./../styles/index.module.css";
import { useRouter } from "next/router";

export default function StatusTable({
    columnNames,
    frequencyRow,
    riskRow,
    tableBody,
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
    appSearch
}) {
    const [indicesToShow, setIndicesToShow] = useState([]);
    const router = useRouter();
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
    }, [periodicFilter, transactionalFilter, periodicIndices, transactionalIndices, tableBody, keyControl, keyControlIndices])

    function tableCell(cellValue) {
        return (
            {
                height: '30px',
                width: '30px',
                backgroundColor:
                    (isClicked.length === 0 || isClicked.includes(cellValue)) ?
                        cellValue === 'Updated' ? 'green' :
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
        alignItems: "center"
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
                appName: appName
            }
        })
    }

    return (
        <div className={styles.tableContainer}>
            <table>
                <thead>
                    <tr>
                        {
                            columnNames.map((colName, index) =>
                                indicesToShow.includes(index) &&
                                <th key={index}>{colName}</th>
                            )
                        }
                    </tr>
                    <tr>
                        {
                            frequencyRow.map((freq, index) =>
                                indicesToShow.includes(index) &&
                                <th key={index}>{freq}</th>
                            )
                        }
                    </tr>
                    <tr>
                        {
                            riskRow.map((risk, index) =>
                                indicesToShow.includes(index) &&
                                <th key={index}>{risk}</th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        tableBody.map((row, index) =>
                            row &&
                            (regionFilter.length === 0 || regionFilter.includes(row[row.length - 2])) && (!soxInScope || row[row.length - 1] === 'Y') &&
                            (isClicked.length === 0 || handleStatusCheck(row)) &&
                            (appSearch == "" || row[0].toLowerCase().includes(appSearch.toLowerCase())) && (
                                <tr key={index}>
                                    {
                                        row.map((cell, tdIndex) =>
                                            indicesToShow.includes(tdIndex) &&
                                            <td key={tdIndex}>
                                                {
                                                    <div style={tdStyles}>
                                                        {
                                                            cell && cell !== 'NAN' && (
                                                                <div onClick={() => {
                                                                    tdIndex === 0 && handleAppClick(cell)
                                                                }}
                                                                    style={tdIndex !== 0 ? tableCell(cell) : {}}>
                                                                    {madatoryRows.includes(tdIndex) && cell}
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                }
                                            </td>
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