import { useRouter } from "next/router"
import styles from "@/styles/AppData.module.css"
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";

export default function UpdateStatus({ data }) {
    console.log("appMetadata", data);
    const router = useRouter();
    const params = router.query;
    const [showData, setShowData] = useState(['Updated', 'InProg']);
    const [appMetadata, setAppMetadata] = useState([]);
    const [appData, setAppData] = useState([]);

    useEffect(() => {
        setAppMetadata(data?.appMetadata);
        setAppData(data?.appData);
    }, [data])

    const [formData, setFormData] = useState({
        APP_ID: params.APP_ID || "",
        CNTRL_ID: params.CNTRL_ID || '',
        NOTES: showData.includes(appData[9]) ? appData[8] : '',
        RESULT: showData.includes(appData[9]) ? appData[10] || "none" : 'select',
        RESULT_REASON: showData.includes(appData[9]) ? appData[11] : '',
        PROCESS_STATUS: appData[9] || '',
        ARTIFACT_URL: showData.includes(appData[9]) ? appData[7] : ''
    })

    useEffect(() => {
        function handleFormData() {
            const newFormData = {
                ...formData,
                NOTES: showData.includes(appData[9]) ? appData[8] : '',
                RESULT: showData.includes(appData[9]) ? appData[10] || "none" : 'select',
                RESULT_REASON: showData.includes(appData[9]) ? appData[11] : '',
                PROCESS_STATUS: appData[9] || '',
                ARTIFACT_URL: showData.includes(appData[9]) ? appData[7] : ''
            };

            if (JSON.stringify(formData) !== JSON.stringify(newFormData)) {
                setFormData(newFormData);
            }
        }
        handleFormData();
    }, [appData, formData, showData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            const response = await axios.post('http://localhost:75/update-status', formData);
            console.log(response);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div>
            <Navbar />
            <div className={styles.form}>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div>
                        <label htmlFor="APP_ID">App Id</label><br />
                        <input value={formData.APP_ID}
                            onChange={(e) => handleChange(e)} type="text" id="APP_ID" name="APP_ID" readOnly={true} />
                    </div>
                    <div>
                        <label htmlFor="CNTRL_ID">Control Id</label><br />
                        <input value={formData.CNTRL_ID} onChange={(e) => handleChange(e)} type="text" id="CNTRL_ID" name="CNTRL_ID" readOnly={true} />
                    </div>
                    <div>
                        <label htmlFor="NOTES">Notes</label><br />
                        <textarea cols={50} rows={4}
                            value={formData.NOTES}
                            onChange={(e) => handleChange(e)} type="text" id="NOTES" name="NOTES" required
                        />
                    </div>
                    <div>
                        <label htmlFor="ARTIFACT_URL">Artifact URL</label><br />
                        <textarea cols={50} rows={4}
                            value={formData.ARTIFACT_URL}
                            onChange={(e) => handleChange(e)} type="text" id="ARTIFACT_URL" name="ARTIFACT_URL" required
                        />
                    </div>
                    <div>
                        <label htmlFor="RESULT">Result</label><br />
                        <select defaultValue={formData.RESULT} id="RESULT" name="RESULT"
                            onChange={(e) => setFormData({
                                ...formData, RESULT: e.target.value
                            })}
                        >
                            <option value='none'>Select</option>
                            <option value='Green'>Green</option>
                            <option value='Yellow'>Yellow</option>
                            <option value='Red'>Red</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="RESULT_REASON">Result Reason</label><br />
                        <textarea cols={50} rows={4}
                            value={formData.RESULT_REASON}
                            onChange={(e) => handleChange(e)} type="text" id="RESULT_REASON" name="RESULT_REASON" required />
                    </div>
                    <div>
                        <button type="submit">Update</button>
                    </div>
                </form>
            </div >
        </div >
    )
}

export async function getServerSideProps(context) {
    const params = context.query;
    console.log(params);
    const getAppMetadata = await axios.post('http://localhost:75/app-data', params);

    return {
        props: {
            data: getAppMetadata.data || []
        }
    }
}