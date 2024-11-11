import Navbar from "@/components/Navbar";
import axios from "axios";
import styles from "@/styles/AppData.module.css"
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { decrypt } from "../api/auth/lib";

export default function WorkList({ worklistData }) {
    const [data, setData] = useState([]);
    const [countRecords, setCountRecords] = useState(0);

    const router = useRouter();
    useEffect(() => {
        setData(worklistData.worklistData);
    }, [worklistData])

    const handleDateFormat = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const formattedDay = day < 10 ? '0' + day : day;
        const formattedMonth = month < 10 ? '0' + month : month;
        return `${formattedDay}-${formattedMonth}-${year}`;
    }

    const getStyles = (status) => {
        let statusStyles = {
            color: 'white',
            textAlign: 'center',
            padding: '5px',
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
        }
        if (status === 'Completed') {
            statusStyles['backgroundColor'] = 'green'
        } else if (['Update', 'Updated'].includes(status)) {
            statusStyles['backgroundColor'] = 'blue'
        } else if (status === 'Overdue') {
            statusStyles['backgroundColor'] = 'red'
        } else if (status === 'In Progress') {
            statusStyles['backgroundColor'] = 'yellow'
        }
        return statusStyles;
    }

    const handleUpdateStatus = (CNTRL_ID, APP_ID, notes, progress_status, result, resultReason) => {
        router.replace({
            pathname: '/update',
            query: { CNTRL_ID: CNTRL_ID, APP_ID: APP_ID, notes: notes, progress_status: progress_status, result: result, resultReason: resultReason }
        })
    }

    useEffect(() => {
        let count = 0;
        data?.map((row, index) => {
            if (row[9] !== 'Updated')
                count++;
        })
        setCountRecords(count);
    }, [data])

    return (
        <div>
            <div className={styles.appDataSection}>
                {
                    countRecords !== 0 ? (
                        <table border={1}>
                            <thead>
                                <tr>
                                    <th>Application ID</th>
                                    <th>Control Id</th>
                                    <th>Last Update</th>
                                    <th>Next Schedule</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data?.map((row, index) =>
                                    (
                                        row[9] !== 'Updated' && (
                                            <tr key={index}>
                                                <td>{row[0]}</td>
                                                <td>{row[2]}</td>
                                                <td>{handleDateFormat(row[5])}</td>
                                                <td>{handleDateFormat(row[4])}</td>
                                                <td>
                                                    <div onClick={() => handleUpdateStatus(row[2], row[0], row[8], row[9], row[10], row[11])} style={getStyles(row[9])}
                                                    >
                                                        {row[9]}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    ))
                                }
                            </tbody>
                        </table>
                    ) : (
                        <div>
                            No worklist records to show
                        </div>
                    )
                }
            </div>
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

    try {
        const worklistData = await axios.get(`http://localhost:75/worklist-data`, {
            params: { ownerName: payload.username }
        });
        return {
            props: {
                worklistData: worklistData.data
            }
        }
    } catch (error) {
        console.log(error);
        return {
            props: {
                worklistData: []
            }
        }
    }
}