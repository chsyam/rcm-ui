import { useEffect, useState } from "react";
import styles from "./../styles/index.module.css";

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
    transactionalIndices
}) {
    const [indicesToShow, setIndicesToShow] = useState([]);
    useEffect(() => {
        function handleIndices() {
            let indices = [0, tableBody[0]?.length - 1, tableBody[0]?.length - 2];
            if ((periodicFilter && transactionalFilter) || (!periodicFilter && !transactionalFilter)) {
                indices = indices.concat(periodicIndices, transactionalIndices);
                return indices;
            } if (periodicFilter) {
                indices = indices.concat(periodicIndices);
            } if (transactionalFilter) {
                indices = indices.concat(transactionalIndices);
            }
            return indices;
        }
        setIndicesToShow(handleIndices());
    }, [periodicFilter, transactionalFilter, periodicIndices, transactionalIndices, tableBody])

    function tableCell(cellValue) {
        return (
            {
                height: '30px',
                width: '30px',
                backgroundColor:
                    cellValue === 'Updated' ? 'green' :
                        cellValue === 'Inprog' ? 'yellow' :
                            cellValue === 'Schedule' ? 'blue' :
                                cellValue === 'Overdue' ? 'red' : '',
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
                            (regionFilter.length === 0 || regionFilter.includes(row[row.length - 2])) && (!soxInScope || row[row.length - 1] === 'Y') && (
                                <tr key={index}>
                                    {
                                        row.map((cell, tdIndex) =>
                                            indicesToShow.includes(tdIndex) &&
                                            <td key={tdIndex}>
                                                <div style={tdStyles}>
                                                    {
                                                        cell && cell !== 'NAN' && <div style={tdIndex !== 0 ? tableCell(cell) : {}}>
                                                            {tdIndex === 0 && cell}
                                                            {tdIndex === row.length - 2 && cell}
                                                            {tdIndex === row.length - 1 && cell}
                                                        </div>
                                                    }
                                                </div>
                                            </td>
                                        )
                                    }
                                </tr>
                            )
                        )
                    }
                </tbody>
            </table>
        </div>
    );
}