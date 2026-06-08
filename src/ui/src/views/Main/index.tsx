import { APP_CHANNELS } from '@common/channels/app.channels';
import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocketChannel from '../../hooks/useSocketChannel';

type ContentResponse = {
    content: string;
};

const MainView = () => {
    const { request, socket, isConnected } = useSocketChannel();
    const navigate = useNavigate();
    const [systemTime, setSystemTime] = useState<number | null>(null);
    const [content, setContent] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [time, contentData] = await Promise.all([
                    request<number>(APP_CHANNELS.GET_SYSTEM_TIME),
                    request<ContentResponse>(APP_CHANNELS.MAIN_GET_CONTENT)
                ]);

                setSystemTime(time);
                setContent(contentData.content);
            } catch (error) {
                console.error('Error loading Main view data:', error);
            }
        };

        fetchData();
    }, [request]);

    useEffect(() => {
        const listener = (payload: ContentResponse) => {
            setContent(payload.content || '');
        };

        socket.on(APP_CHANNELS.MAIN_CONTENT_UPDATED, listener);

        return () => {
            socket.off(APP_CHANNELS.MAIN_CONTENT_UPDATED, listener);
        };
    }, [socket]);

    return (
        <Flex justify="center" style={{ padding: 24 }}>
            <Card style={{ width: '100%', maxWidth: 920 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Typography.Title level={2} style={{ margin: 0 }}>Main</Typography.Title>

                    <Space wrap>
                        <Typography.Text strong>Estado del socket:</Typography.Text>
                        <Tag color={isConnected ? 'success' : 'error'}>
                            {isConnected ? 'conectado' : 'desconectado'}
                        </Tag>
                    </Space>

                    <Typography.Text>
                        Hora del sistema: {systemTime ? new Date(systemTime).toLocaleString() : 'Cargando...'}
                    </Typography.Text>

                    <Card size="small" title="Contenido interactivo">
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                            {content || 'Sin contenido cargado'}
                        </Typography.Paragraph>
                    </Card>

                    <div>
                        <Button type="primary" onClick={() => navigate('/panel')}>
                            Ir al Panel
                        </Button>
                    </div>
                </Space>
            </Card>
        </Flex>
    );
};

export default MainView;
