import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { ForwardedRef, ReactNode, useEffect, useRef, useState } from 'react';
import { Button, Card, Dialog, Portal, Text, TextInput, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Keyboard, TextInput as RNTextInput } from 'react-native';

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
	const [currentAddress, setCurrentAddress] = useState('');
	const [address, setAddress] = useState('');
	getItemAsync('address').then((value) => {
		if (value) setCurrentAddress(value);
	});

	function submitAddress() {
		setCurrentAddress(address);
		setItemAsync('address', address);
	}

	const addressInputRef = useRef<RNTextInput>();

	function onPress() {
		addressInputRef.current?.blur();
		submitAddress();
	}

	useEffect(() => {
		const listener = Keyboard.addListener('keyboardDidHide', () => {
			addressInputRef.current?.blur();
		});

		return () => listener.remove();
	});

	return (
		<SettingCard
			title="伺服器"
			actions={
				<Button mode="contained" onPress={onPress}>
					儲存
				</Button>
			}
		>
			<TextInput
				submitBehavior="blurAndSubmit"
				mode="outlined"
				label="伺服器位址"
				onChangeText={setAddress}
				onSubmitEditing={submitAddress}
				ref={addressInputRef as ForwardedRef<RNTextInput>}
				placeholder={currentAddress}
			/>
		</SettingCard>
	);
}

const ErrorMessageMap = {
	[401]: 'Unauthorized',
	[404]: 'Not Found',
	[409]: 'Key already exists',
	[405]: 'Method Not Allowed',
};

function PublicKeyCard({
	setErrorMessage,
	showErrorDialog,
}: {
	setErrorMessage: (message: string) => void;
	showErrorDialog: () => void;
}) {
	const [publicKey, setPublicKey] = useState('');
	getItemAsync('publicKey').then((value) => value && setPublicKey(value));

	async function onSendPublicKey() {
		const response = await fetch(
			`http://${
				(await getItemAsync('address')) ?? 'http://localhost:3000'
			}/publicKey`,
			{
				body: publicKey,
				method: 'POST',
				headers: { 'Content-Type': 'text/plain' },
			}
		);
		if (!response.ok) {
			setErrorMessage(
				ErrorMessageMap[response.status as keyof typeof ErrorMessageMap] ??
					'Unknown error'
			);
			showErrorDialog();
		}
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
	const [requestFailedDialogVisible, setRequestFailedDialogVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState('Unknown error');
	const showRequestFailedDialog = () => setRequestFailedDialogVisible(true);

	return (
		<SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Title>設定</Title>
			<AddressCard />
			<PublicKeyCard
				setErrorMessage={setErrorMessage}
				showErrorDialog={showRequestFailedDialog}
			/>
			<Portal>
				<Dialog visible={requestFailedDialogVisible} dismissable>
					<Dialog.Title>錯誤</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">{errorMessage}</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setRequestFailedDialogVisible(false)}>
							關閉
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</SafeAreaView>
	);
}
