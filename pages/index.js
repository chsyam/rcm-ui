import axios from "axios";
import { useEffect, useState } from "react";
import StatusTable from "@/components/StatusTable";
import FilterSection from "./FilterSection";

export default function Home({ dashboardData }) {
    const [columnNames, setColumnNames] = useState([]);
    const [frequencyRow, setFrequencyRow] = useState([]);
    const [riskRow, setRiskRow] = useState([]);
    const [tableBody, setTableBody] = useState([]);

    const [regionFilter, setRegionFilter] = useState([]);
    const [soxInScope, setSoxInScope] = useState(false);
    const [periodicFilter, setPeriodicFilter] = useState(false);
    const [transactionalFilter, setTransactionalFilter] = useState(false);

    const [periodicIndices, setPeriodicIndices] = useState([]);
    const [transactionalIndices, setTransactionalIndices] = useState([]);
    const [keyControl, setKeyControl] = useState(false);

    useEffect(() => {
        setColumnNames(dashboardData[0][0].column_headings);
        setFrequencyRow(dashboardData[0][0].frequency);
        setRiskRow(dashboardData[0][0].risk);
        setTableBody(dashboardData[0][0].records);
    }, [dashboardData, regionFilter, soxInScope])

    useEffect(() => {
        function handleIndices() {
            let periodicIndices = [];
            let transactionalIndices = [];
            frequencyRow.forEach((cellValue, rowIndex) => {
                if (cellValue === "Trans") {
                    transactionalIndices.push(rowIndex);
                } else {
                    periodicIndices.push(rowIndex);
                }
            });

            setPeriodicIndices(periodicIndices);
            setTransactionalIndices(transactionalIndices);
        }
        handleIndices();
    }, [frequencyRow])

    return (
        <div>
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
            />
            <StatusTable
                columnNames={columnNames}
                frequencyRow={frequencyRow}
                riskRow={riskRow}
                tableBody={tableBody}
                regionFilter={regionFilter}
                soxInScope={soxInScope}
                periodicFilter={periodicFilter}
                transactionalFilter={transactionalFilter}
                periodicIndices={periodicIndices}
                transactionalIndices={transactionalIndices}
                keyControl={keyControl}
            />
        </div>
    );
}

export async function getServerSideProps() {
    try {
        const dashboardData = await axios.get("http://localhost:75/dashboard-data");
        console.log(dashboardData.data)

        return {
            props: {
                dashboardData: [dashboardData.data]
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                dashboardData: []
            }
        }
    }
}