import { useEffect, useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import Editor from '@monaco-editor/react';
import { writeTextFile } from '@tauri-apps/api/fs';
import { appWindow } from '@tauri-apps/api/window';

function App() {
	const [fileType, setFileType] = useState('');
	const [content, setContent] = useState('');
	const [path, setPath] = useState('open a file to get started');
	const [darkmode, setDarkmode] = useState(true);

	const extensionDict: { [key: string]: string } = {
		txt: 'text',
		js: 'javascript',
		html: 'html',
		css: 'css',
		cpp: 'cpp',
		c: 'c',
		java: 'java',
		py: 'python',
		rs: 'rust',
		ts: 'typescript',
		tsx: 'typescript',
		jsx: 'javascript',
		json: 'json',
		svg: 'svg',
		md: 'markdown',
	};

	const getFileType = (path: string) => {
		const ext = path.split('.').pop();
		setFileType(ext !== undefined ? extensionDict[ext] : '');
	};

	const handleOpen = async () => {
		try {
			const selectedPath = await open({
				multiple: false,
				title: 'open file',
			});
			if (!selectedPath) return;
			setPath(selectedPath as string);
			setContent(await readTextFile(selectedPath as string));
			getFileType(selectedPath as string);
		} catch (err) {
			console.error(err);
		}
	};

	const saveFile = async () => {
		try {
			await writeTextFile(path, content);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		document
			.getElementById('titlebar-minimize')!
			.addEventListener('click', () => appWindow.minimize());
		document
			.getElementById('titlebar-maximize')!
			.addEventListener('click', () => appWindow.toggleMaximize());
		document
			.getElementById('titlebar-close')!
			.addEventListener('click', () => appWindow.close());
	}, []);

	return (
		<div className="container">
			<div
				data-tauri-drag-region
				className={darkmode ? 'dark titlebar' : 'light titlebar'}
			>
				<div className="btn-box">
					<button onClick={handleOpen}>open</button>
					<button onClick={saveFile}>save</button>
					<button onClick={() => setDarkmode(!darkmode)}>
						{darkmode ? 'light' : 'dark'}
					</button>
				</div>
				<span className="title">{path.substring(path.length - 80)}</span>
				<div>
					<div className="titlebar-button" id="titlebar-minimize"></div>
					<div className="titlebar-button" id="titlebar-maximize"></div>
					<div className="titlebar-button" id="titlebar-close"></div>
				</div>
			</div>
			<Editor
				value={content}
				theme={darkmode ? 'vs-dark' : 'vs-light'}
				height="calc(100vh - 30px)"
				width="100%"
				language={fileType}
				onChange={(newValue, e) => setContent(newValue ?? '')}
				options={{
					minimap: {
						enabled: false,
					},
					fontFamily:
						'Iosevka expanded, fireCode, SF mono, Jetbrains mono, consolas, monospace',
					fontSize: 15,
					fontLigatures: true,
					cursorStyle: 'block',
					wordWrap: 'on',
					useShadowDOM: false,
					inDiffEditor: false,
					cursorSmoothCaretAnimation: 'on',
					cursorBlinking: 'phase',
					renderLineHighlight: 'gutter',
				}}
			/>
		</div>
	);
}

export default App;
