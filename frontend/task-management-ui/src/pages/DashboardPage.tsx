import { useEffect, useState } from 'react';
import { BarChart, DonutChart } from '@mantine/charts';
import { Card, Grid, Group, Paper, SimpleGrid, Text, Title } from '@mantine/core';
import { getDashboardStats } from '../api/endpoints';
import type { DashboardStats } from '../types';

const TYPE_COLORS: Record<string, string> = {
  Feature: 'var(--mantine-color-grape-5)',
  Story: 'var(--mantine-color-teal-5)',
  Task: 'var(--mantine-color-indigo-5)',
  Bug: 'var(--mantine-color-red-5)',
};

function StatTile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text size="xl" fw={700} c={color}>
        {value}
      </Text>
    </Paper>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Text>Loading…</Text>;

  return (
    <div>
      <Title mb="md">Dashboard</Title>

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
        <StatTile label="Total work items" value={stats.totalWorkItems} />
        <StatTile label="Overdue" value={stats.overdueCount} color="red" />
        <StatTile label="Due this week" value={stats.dueThisWeekCount} color="orange" />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="md" h="100%">
            <Title order={4} mb="sm">
              By status
            </Title>
            {stats.byStatus.length === 0 ? (
              <Text c="dimmed">No work items yet.</Text>
            ) : (
              <BarChart
                h={260}
                data={stats.byStatus.map((s) => ({ status: s.statusName, count: s.count }))}
                dataKey="status"
                series={[{ name: 'count', color: 'indigo.5' }]}
              />
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" p="md" h="100%">
            <Title order={4} mb="sm">
              By type
            </Title>
            {stats.byType.length === 0 ? (
              <Text c="dimmed">No work items yet.</Text>
            ) : (
              <Group justify="center">
                <DonutChart
                  data={stats.byType.map((t) => ({ name: t.type, value: t.count, color: TYPE_COLORS[t.type] }))}
                />
              </Group>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={12}>
          <Card withBorder radius="md" p="md">
            <Title order={4} mb="sm">
              By priority
            </Title>
            {stats.byPriority.length === 0 ? (
              <Text c="dimmed">No work items yet.</Text>
            ) : (
              <BarChart
                h={220}
                data={stats.byPriority.map((p) => ({ priority: p.priority, count: p.count }))}
                dataKey="priority"
                series={[{ name: 'count', color: 'blue.5' }]}
                withLegend={false}
              />
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
