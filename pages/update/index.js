import { useRouter } from "next/router"
import styles from "@/styles/AppData.module.css"
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function UpdateStatus() {
    const router = useRouter();
    const params = router.query;
    const showData = ['Completed', 'InProg'];

    const [formData, setFormData] = useState({
        APP_ID: params.appId || "",
        CNTRL_ID: params.controlId || '',
        NOTES: showData.includes(params.progress_status) ? params.notes || "" : '',
        RESULT: showData.includes(params.progress_status) ? params.result || "none" : 'select',
        RESULT_REASON: showData.includes(params.progress_status) ? params.resultReason || "" : '',
        PROGRESS_STATUS: params.progress_status || ""
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData)
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