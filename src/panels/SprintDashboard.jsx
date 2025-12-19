/**
 * 📊 Sprint Dashboard Panel
 */

import ForgeUI, { render, Fragment, Text, Heading, Badge, Table, Head, Cell, Row } from '@forge/ui';

const SprintDashboard = () => {
    return (
        <Fragment>
            <Heading size="large">🏎️ Sprint Strategist</Heading>

            <Text>**Sprint Health Dashboard**</Text>

            <Table>
                <Head>
                    <Cell><Text>Metric</Text></Cell>
                    <Cell><Text>Value</Text></Cell>
                    <Cell><Text>Status</Text></Cell>
                </Head>
                <Row>
                    <Cell><Text>Health Score</Text></Cell>
                    <Cell><Text>--/100</Text></Cell>
                    <Cell><Badge appearance="primary">Loading...</Badge></Cell>
                </Row>
                <Row>
                    <Cell><Text>Velocity</Text></Cell>
                    <Cell><Text>-- pts</Text></Cell>
                    <Cell><Badge appearance="default">-</Badge></Cell>
                </Row>
                <Row>
                    <Cell><Text>Completion</Text></Cell>
                    <Cell><Text>--%</Text></Cell>
                    <Cell><Badge appearance="default">-</Badge></Cell>
                </Row>
            </Table>

            <Text>*Use Rovo AI to ask: "What's our sprint health?"*</Text>
        </Fragment>
    );
};

export const run = render(<SprintDashboard />);
