import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { ForwardedRef, ReactNode, useEffect, useRef, useState } from 'react';
import { Button, Card, Text, TextInput, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

function SettingCard({
	title,
	children: content,
	actions,
}: {
	title: string;
	children: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<Card mode="outlined" style={{ padding: 0, alignSelf: 'stretch', margin: 25 }}>
			<Card.Title
				title={title}
				style={{ paddingTop: 30, paddingLeft: 30, paddingBottom: 10 }}
			/>
			<Card.Content style={{ paddingLeft: 30, paddingRight: 30 }}>
				{content}
			</Card.Content>
			<Card.Actions style={{ paddingTop: 10, paddingBottom: 20, paddingRight: 30 }}>
				{actions}
			</Card.Actions>
		</Card>
	);
}

function AddressCard() {
	const [address, setAddress] = useState('');
	const [currentAddress, setCurrentAddress] = useState('');
	getItemAsync('address').then((value) => value && setCurrentAddress(value));

	async function submitAddress() {
		setCurrentAddress(address);
		setItemAsync('address', address);
	}

	return (
		<SettingCard title="伺服器" actions={<Button mode="contained">儲存</Button>}>
			<TextInput
				submitBehavior="blurAndSubmit"
				mode="outlined"
				label="伺服器位址"
				onChangeText={setAddress}
				placeholder={currentAddress}
				onSubmitEditing={submitAddress}
			/>
		</SettingCard>
	);
}

function PublicKeyCard() {
	const [publicKey, setPublicKey] = useState('');
	getItemAsync('publicKey').then((value) => value && setPublicKey(value));

	async function onSendPublicKey() {
		await fetch(
			`http://${
				(await getItemAsync('address')) ?? 'http://localhost:3000'
			}/publicKey`,
			{
				body: publicKey,
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
			}
		);
	}

	return (
		<SettingCard
			title="公鑰"
			actions={
				<Button mode="contained" onPress={onSendPublicKey}>
					傳送
				</Button>
			}
		>
			<Text variant="bodyMedium">{publicKey}</Text>
		</SettingCard>
	);
}

export default function Settings() {
	return (
		<SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Title>設定</Title>
			<AddressCard />
			<PublicKeyCard />
		</SafeAreaView>
	);
}
