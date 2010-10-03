<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title><?php echo $config['title']; ?></title>

	<link rel="stylesheet" type="text/css" media="screen" href="<?php echo BASE_PATH; ?>/libs/reset.css" />
	<link rel="stylesheet" type="text/css" media="screen" href="<?php echo BASE_PATH; ?>/assets/<?php echo $config['theme']; ?>.css" />

	<script type="text/javascript" src="<?php echo BASE_PATH; ?>/libs/mootools.js"></script>
	<script type="text/javascript" src="<?php echo BASE_PATH; ?>/assets/packager.js"></script>

	<script type="text/javascript">document.addEvent('domready', Packager.init);</script>

</head>
<body>

	<form id="packager" action="<?php echo BASE_PATH; ?>/web/download" method="post">

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
									<input type="button" class="deselect disabled" value="deselect package" />
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

				<tr class="<?php echo ($i == $c) ? 'last' : 'middle'?> unchecked">
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

		<div id="options">
			<table class="horizontal">

			<?php if (!empty($config['blocks'])): ?>

				<tr class="first">
					<th class="first last" colspan="3">
						Include code blocks
					</th>
				</tr>

			<?php foreach($config['blocks'] as $block => $description): ?>

				<tr class="middle checked selected">
					<td class="first check">
						<div class="checkbox"></div>
						<input type="checkbox" name="blocks[]" value="<?php echo $block; ?>" checked="checked" />
					</td>
					<td class="middle"><?php echo $block ?></td>
					<td class="last"><?php echo $description ?></td>
				</tr>

			<?php

			endforeach;
			endif;

			if (!empty($config['compressors'])):

			?>

				<tr class="<?php echo (empty($config['blocks'])) ? 'first' : 'middle'; ?>">
					<th class="first last" colspan="3">
						Compression
					</th>
				</tr>

			<?php

			$compressors = $config['compressors'];

			$i = 0;

			foreach($compressors as $compressor):
				$i++

			?>

				<tr class="middle <?php echo ($i == 1) ? 'checked selected' : 'unchecked'; ?>">
					<td class="first check">
						<div class="radio"></div>
						<input type="radio" name="compressor" value="<?php echo $compressor; ?>"<?php if ($i == 1) echo ' checked="checked"'; ?> />
					</td>
					<td class="middle"><?php echo $compressor; ?> Compression</td>
					<td class="last">

					<?php

						switch (strtolower($compressor)){

							case 'yui':
								echo 'Uses <a href="http://www.julienlecomte.net/yuicompressor/">YUI Compressor</a>
								by <a href="http://www.julienlecomte.net/">Julien Lecomte</a>, to clean whitespace
								and rename internal variables to shorter values. Highest compression ratio.';
							break;

							case 'jsmin':
								echo 'Uses <a href="http://www.crockford.com/javascript/jsmin.html">JSMin</a> by
								<a href="http://www.crockford.com/">Douglas Crockford</a>. Cleans comments and
								whitespace.';
							break;

						}

					?>

					</td>
				</tr>

			<?php endforeach; ?>

				<tr class="last <?php echo (count($compressors)) ? 'unchecked' : 'checked selected'; ?>">
					<td class="first check">
						<div class="radio"></div>
						<input type="radio" name="compressor" value=""<?php if (!count($compressors)) echo ' checked="checked"'; ?> />
					</td>
					<td class="middle">No Compression</td>
					<td class="last">Uncompressed source. Recommended in testing phase.</td>
				</tr>

			<?php endif; ?>

			</table>
		</div>

		<p class="submit">
			<input type="reset" value="reset" />
			<input type="submit" value="download" />
		</p>

	</form>

</body>
</html>
