import React from 'react';
import Page from 'src/pages/Page';
import { useTheme } from 'src/themes/use-theme';

const PrivacyPolicyPage: React.FC = () => {
        useTheme();
    
    return (
        <Page title="Privacy Policy">
        <div className="privacy-policy-page">
            <p>In Progress</p>
        </div>
        </Page>
    );
};

export default PrivacyPolicyPage;
