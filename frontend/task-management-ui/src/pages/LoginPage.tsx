import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Card, Container, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={80}>
      <Title ta="center">Sign in</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don't have an account? <Anchor component={Link} to="/register">Register</Anchor>
      </Text>

      <Card withBorder shadow="sm" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />
            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}
            <Button type="submit" fullWidth loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Card>

      <Text c="dimmed" size="xs" ta="center" mt="md">
        Seeded admin account: admin@taskms.local / Admin@123
      </Text>
    </Container>
  );
}
