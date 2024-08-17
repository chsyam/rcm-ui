import styles from "./../styles/Filters.module.css"

export default function FilterSection({
    setRegionFilter,
    regionFilter,
    setSoxInScope,
    soxInScope,
    setPeriodicFilter,
    periodicFilter,
    setTransactionalFilter,
    transactionalFilter,
    keyControl,
    setKeyControl
}) {
    const handleRegionFiletr = (regionName) => {
        if (regionFilter.includes(regionName)) {
            setRegionFilter(regionFilter.filter(item => item !== regionName));
        } else {
            setRegionFilter([...regionFilter, regionName]);
        }
    }

    const handleSoxInScope = () => {
        setSoxInScope(!soxInScope);
    }

    const handlePeriodicFilter = () => {
        setPeriodicFilter(!periodicFilter);
    }

    const handleTransactionalFilter = () => {
        setTransactionalFilter(!transactionalFilter);
    }

    const handleKeyControl = () => {
        setKeyControl(!keyControl);
    }

    return (
        <div className="filterSection">
            <div className={styles.filterButtons}>
                <div
                    style={regionFilter.includes("APAC") ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleRegionFiletr("APAC")}
                >APAC</div>
                <div
                    style={regionFilter.includes("EMEA") ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleRegionFiletr("EMEA")}
                >EMEA</div>
                <div
                    style={regionFilter.includes("LATAM") ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleRegionFiletr("LATAM")}
                >LATAM</div>
                <div
                    style={regionFilter.includes("NAMER") ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleRegionFiletr("NAMER")}> NA</div>
                <div style={soxInScope ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleSoxInScope()}
                >SOX IN SCOPE</div>
                <div style={transactionalFilter ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleTransactionalFilter()}
                >Transactional</div>
                <div style={periodicFilter ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handlePeriodicFilter()}
                >Periodic</div>
                <div style={keyControl ? { backgroundColor: "#008080", color: "#FFF" } : {}}
                    className={styles.filter}
                    onClick={() => handleKeyControl()}
                >Key Control</div>
            </div>
            {keyControl.toString()}
        </div>
    )
}