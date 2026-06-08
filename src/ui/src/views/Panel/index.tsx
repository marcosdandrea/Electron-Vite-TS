import { APP_CHANNELS } from '@common/channels/app.channels';
import { Alert, Button, Card, Flex, Form, Input, Space, Tag, Typography, message as antdMessage } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocketChannel from '../../hooks/useSocketChannel';

const PanelView = () => {
    const { request, isConnected } = useSocketChannel();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [content, setContent] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleAuthenticate = async () => {
        try {
            await request(APP_CHANNELS.PANEL_AUTHENTICATE, { password });
            setIsAuthenticated(true);
            setStatusMessage('Acceso al panel concedido.');
            antdMessage.success('Acceso al panel concedido.');
        } catch (error) {
            setIsAuthenticated(false);
            setStatusMessage('Contraseña inválida.');
            antdMessage.error('Contraseña inválida.');
            console.error(error);
        }
    };

    const handleSaveContent = async () => {
        try {
            await request(APP_CHANNELS.PANEL_SET_CONTENT, { content });
            setStatusMessage('Contenido actualizado correctamente.');
            antdMessage.success('Contenido actualizado correctamente.');
        } catch (error) {
            setStatusMessage('No se pudo actualizar el contenido.');
            antdMessage.error('No se pudo actualizar el contenido.');
            console.error(error);
        }
    };

    return (
        <Flex justify="center" style={{ padding: 24 }}>
            <Card style={{ width: '100%', maxWidth: 920 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Typography.Title level={2} style={{ margin: 0 }}>Panel</Typography.Title>

                    <Space wrap>
                        <Typography.Text strong>Estado del socket:</Typography.Text>
                        <Tag color={isConnected ? 'success' : 'error'}>
                            {isConnected ? 'conectado' : 'desconectado'}
                        </Tag>
                    </Space>

                    {!isAuthenticated && (
                        <Card size="small" title="Autenticacion del panel">
                            <Form layout="vertical" onFinish={handleAuthenticate}>
                                <Form.Item label="Contraseña del panel" required>
                                    <Input.Password
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Ingresa la contraseña"
                                    />
                                </Form.Item>
                                <Button type="primary" htmlType="submit">Ingresar</Button>
                            </Form>
                        </Card>
                    )}

                    {isAuthenticated && (
                        <Card size="small" title="Configuracion y carga de contenido">
                            <Form layout="vertical" onFinish={handleSaveContent}>
                                <Form.Item label="Contenido para Main" required>
                                    <Input.TextArea
                                        value={content}
                                        onChange={(event) => setContent(event.target.value)}
                                        placeholder="Escribe el contenido que se mostrara en Main"
                                        rows={8}
                                    />
                                </Form.Item>
                                <Button type="primary" htmlType="submit">Guardar contenido</Button>
                            </Form>
                        </Card>
                    )}

                    {statusMessage && <Alert type="info" showIcon message={statusMessage} />}

                    <div>
                        <Button onClick={() => navigate('/main')}>Volver a Main</Button>
                    </div>
                </Space>
            </Card>
        </Flex>
    );
};

export default PanelView;
