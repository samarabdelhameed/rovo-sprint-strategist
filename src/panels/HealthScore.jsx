/**
 * 🏥 Health Score Component
 */

import ForgeUI, { render, Fragment, Text, Badge } from '@forge/ui';

const HealthScore = ({ score }) => {
    const getAppearance = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'primary';
        if (score >= 40) return 'warning';
        return 'removed';
    };

    const getLabel = (score) => {
        if (score >= 80) return '🟢 Excellent';
        if (score >= 60) return '🟡 Good';
        if (score >= 40) return '🟠 At Risk';
        return '🔴 Critical';
    };

    return (
        <Fragment>
            <Text content={`**Sprint Health: ${score}/100**`} />
            <Badge appearance={getAppearance(score)} text={getLabel(score)} />
        </Fragment>
    );
};

export default HealthScore;
