<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title><?php echo $config['title']; ?></title>

	<link rel="stylesheet" type="text/css" media="screen" href="<?php echo BASE_PATH; ?>/libs/reset.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="<?php echo BASE_PATH; ?>/assets/<?php echo $config['theme']; ?>.css" />

	<script src="<?php echo BASE_PATH; ?>/libs/mootools.js" type="text/javascript"></script>
	<script src="<?php echo BASE_PATH; ?>/assets/md5.js" type="text/javascript"></script>
	<script src="<?php echo BASE_PATH; ?>/assets/packager.js" type="text/javascript"></script>
</head>
<body>

	<form id="packager" action="<?php echo BASE_PATH; ?>/download" method="post">
	
	<p class="hash-loader">
		<label>Load your hash <input type="text" value="<?php echo (isset($hash) ? $hash : ''); ?>"/></label>
	</p>
	
	<div style="position: absolute;background: rgba(0, 0, 0, 0.7); top: 5px; left: 5px; border-radius: 12px; -webkit-border-radius:12px; -moz-border-radius:12px;padding:10px;color:#fff; line-height: 20px;">
		Temp Hash Examples:<br />
		1b06dc0cf0267f7ad56376f176862be8<br />
		264a8779ca5948ea528b3fbd075ac9c3<br />
		653562957b1fc1cd3a994ffa5f31c888<br />
		b9c6ed3058a47291c2f60256bf22cfe9<br />
		07671d14df83fdfc74e6a993ee1589f9 // J!<br />
	</div>
	
	<p class="submit">
		<?php foreach ($config['buttons'] as $button): ?>
			<?php if ($button == 'reset'): ?>
				<input type="reset" value="reset" />
			<?php elseif ($button == 'download'): ?>
				<input type="submit" value="download" />
			<?php elseif ($button == 'compress'): ?>
				<input type="submit" name="compress" value="download compressed" />
			<?php endif; ?>
		<?php endforeach; ?>
	</p>

	<?php foreach ($packages as $name => $data): ?>

		<div id="package-<?php echo $name; ?>" class="package">

			<table class="vertical">
				<thead>
					<tr class="first">
						<th>Name</th>
						<td>
							<?php echo $name; ?>
							<div class="buttons">
								<input type="hidden" name="disabled[]" class="toggle" value="" />
								<div class="enabled">
									<input type="button" class="select" value="select package" />
									<input type="button" class="deselect" value="deselect package" />
									<input type="button" class="disable" value="disable package" />
								</div>
								<div class="disabled">
									<input type="button" class="enable" value="enable package" />
								</div>
							</div>
						</td>
					</tr>
				</thead>
				<tbody>
					<tr class="middle">
						<th>Web</th>
						<td><?php echo $data['package_web']; ?></td>
					</tr>
					<tr class="middle">
						<th>Description</th>
						<td><?php echo $data['package_description']; ?></td>
					</tr>
					<tr class="middle">
						<th>Copyright</th>
						<td><?php echo $data['package_copyright']; ?></td>
					</tr>
					<tr class="middle">
						<th>License</th>
						<td><?php echo $data['package_license']; ?></td>
					</tr>
					<tr class="last">
						<th>Authors</th>
						<td><?php echo $data['package_authors']; ?></td>
					</tr>
				</tbody>
			</table>

			<table class="horizontal">
				<tr class="first">
					<th class="first"></th>
					<th class="middle">File</th>
					<th class="middle">Provides</th>
					<th class="last">Description</th>
				</tr>

			<?php

			$files = $data['files'];

			$i = 0;
			$c = count($files);

			foreach ($files as $name => $file):
				$i++;

			?>

				<tr class="<?php echo ($i == $c) ? 'last ' : 'middle '?>unchecked">
					<td class="first check">
						<div class="checkbox"></div>
						<input type="checkbox" name="files[]" value="<?php echo $name; ?>" data-depends="<?php echo $file['depends']; ?>" />
					</td>
					<td class="middle file"><?php echo $file['name']; ?></td>
					<td class="middle provides"><?php echo $file['provides']; ?></td>
					<td class="last description"><?php echo $file['description']; ?></td>
				</tr>

			<?php endforeach; ?>

			</table>

		</div>

	<?php endforeach; ?>

		<p class="submit">
			<?php foreach ($config['buttons'] as $button): ?>
				<?php if ($button == 'reset'): ?>
					<input type="reset" value="reset" />
				<?php elseif ($button == 'download'): ?>
					<input type="submit" value="download" />
				<?php elseif ($button == 'compress'): ?>
					<input type="submit" name="compress" value="download compressed" />
				<?php endif; ?>
			<?php endforeach; ?>
		</p>

	</form>

</body>
</html>
