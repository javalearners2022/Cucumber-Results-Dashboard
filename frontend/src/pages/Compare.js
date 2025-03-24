import React, { useState } from 'react';
import Selection from '../Components/Selection';
import Navbar from '../Components/Navbar';
import { fetchFeatureComparison } from '../services/api';
import FeatureComparison from '../Components/FeatureComparision';
import '../styles/Common.css';

const ComparePage = () => {
    const [selectionOne, setSelectionOne] = useState({ team: '', version: '', environment: '' });
    const [selectionTwo, setSelectionTwo] = useState({ team: '', version: '', environment: '' });

    const isCompareEnabled =
        selectionOne.team && selectionOne.version && selectionOne.environment &&
        selectionTwo.team && selectionTwo.version && selectionTwo.environment;

    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const [uniqueFeatures, setUniqueFeatures] = useState(null);


    const handleCompare = async () => {
        if (!isCompareEnabled) return;
    
        try {
            setLoading(true);  // Show loading state
    
            // Fetch data for both selections
            const data1 = await fetchFeatureComparison(selectionOne.team, selectionOne.version, selectionOne.environment);
            const data2 = await fetchFeatureComparison(selectionTwo.team, selectionTwo.version, selectionTwo.environment);
    
            setComparisonData({ data1, data2 });
            
            setUniqueFeatures(Array.from(
                new Set([...data1.map(f => f.featureId), ...data2.map(f => f.featureId)])
            ));
    
        } catch (error) {
            console.error("Error comparing features:", error);
        } finally {
            setLoading(false); // Hide loading state
        }
    };

    
    return (
        <div>
            <Navbar/>
            <h2>Compare Features</h2>
            <div style={{ display: 'flex', justifyContent:'space-around' }}>
                <Selection onSelectionChange={setSelectionOne} />
                <Selection onSelectionChange={setSelectionTwo} />
            </div>
            <div className="compare-button-container">
                <button 
                    disabled={!isCompareEnabled} 
                    onClick={handleCompare}
                    style={{ 
                        backgroundColor: isCompareEnabled ? "green" : "gray", 
                        color: "white", 
                        padding: "10px 20px", 
                        borderRadius: "5px", 
                        border: "none", 
                        cursor: isCompareEnabled ? "pointer" : "default",
                        fontSize: "16px",
                    }}>
                    {loading ? "Loading..." : "Compare"}
                </button>
            </div>

            {/* {comparisonData && (
                <div>
                    <h3>Comparison Results</h3>
                    <pre>{JSON.stringify(comparisonData, null, 2)}</pre>
                </div>
            )} */}
            <div className="comparison-container">
                {comparisonData &&
                    uniqueFeatures.map((featureId) => {
                        const featureData1 = comparisonData.data1?.find((feature) => feature.featureId === featureId) || null;
                        const featureData2 = comparisonData.data2?.find((feature) => feature.featureId === featureId) || null;

                        return (
                            <FeatureComparison
                                key={featureId}
                                featureId={featureId}
                                featureData1={featureData1}
                                featureData2={featureData2}
                            />
                        );
                    })}
            </div>
            



        </div>
    );
};

export default ComparePage;
